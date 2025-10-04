import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useSocketContext } from "@/contexts/SocketContext";
import { NotificationErrorBoundary } from "@/features/foundations/notification/components/common/NotificationErrorBoundary";
import { useNotificationContext } from "@/features/foundations/notification/contexts/NotificationContext";
import { NotificationInterface } from "@/features/foundations/notification/data/NotificationInterface";
import { usePageUrlGenerator } from "@/hooks/usePageUrlGenerator";
import { BellIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

interface NotificationModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

function NotificationModalContent({ isOpen, setIsOpen }: NotificationModalProps) {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));
  const {
    notifications,
    addNotification,
    generateNotification,
    generateToastNotification,
    markNotificationsAsRead,
    isLoading,
    error,
  } = useNotificationContext();
  const { socketNotifications, removeSocketNotification, clearSocketNotifications } = useSocketContext();
  const t = useTranslations();
  const generateUrl = usePageUrlGenerator();
  const [newNotifications, setNewNotifications] = useState<boolean>(false);
  const preventAutoClose = useRef(false);

  const circuitBreakerRef = useRef({
    count: 0,
    resetTime: 0,
    isOpen: false,
  });

  const checkCircuitBreaker = useCallback(() => {
    const now = Date.now();
    const breaker = circuitBreakerRef.current;

    // Reset counter every 10 seconds
    if (now > breaker.resetTime) {
      breaker.count = 0;
      breaker.resetTime = now + 10000; // 10 seconds
      breaker.isOpen = false;
    }

    // Trip breaker if more than 20 notifications in 10 seconds
    breaker.count++;
    if (breaker.count > 20) {
      breaker.isOpen = true;
      console.warn("🚨 [NotificationModal] Circuit breaker opened - too many notifications");
      return false;
    }

    return !breaker.isOpen;
  }, []);

  const { unreadCount, unreadIds } = useMemo(() => {
    const unreadNotifications = notifications.filter((notif) => !notif.isRead);
    return {
      unreadCount: unreadNotifications.length,
      unreadIds: unreadNotifications.map((notif) => notif.id),
    };
  }, [notifications]);

  useEffect(() => {
    setNewNotifications(unreadCount > 0);
  }, [unreadCount]);

  const processSocketNotificationsRef = useRef<NodeJS.Timeout | null>(null);

  const processSocketNotifications = useCallback(() => {
    if (socketNotifications.length === 0) {
      return;
    }

    if (!checkCircuitBreaker()) {
      clearSocketNotifications(); // Still clear to prevent memory leaks
      return;
    }

    const currentSocketNotifications = [...socketNotifications];
    clearSocketNotifications();

    // Process notifications in smaller batches to prevent UI freeze
    const batchSize = 3;
    const batches = [];
    for (let i = 0; i < currentSocketNotifications.length; i += batchSize) {
      batches.push(currentSocketNotifications.slice(i, i + batchSize));
    }

    batches.forEach((batch, batchIndex) => {
      setTimeout(() => {
        batch.forEach((notification) => {
          addNotification(notification);
          const toastNotification = generateToastNotification(notification, t, generateUrl);

          toast.message(toastNotification.title, {
            description: toastNotification.description,
            action: toastNotification.action,
          });
        });

        // Only set newNotifications on the last batch
        if (batchIndex === batches.length - 1) {
          setNewNotifications(true);
        }
      }, batchIndex * 100); // 100ms delay between batches
    });
  }, [
    socketNotifications,
    clearSocketNotifications,
    addNotification,
    generateToastNotification,
    t,
    generateUrl,
    checkCircuitBreaker,
  ]);

  // 🔗 SOCKET: Throttled processing with 300ms delay
  useEffect(() => {
    if (processSocketNotificationsRef.current) {
      clearTimeout(processSocketNotificationsRef.current);
    }

    processSocketNotificationsRef.current = setTimeout(() => {
      processSocketNotifications();
    }, 300); // 300ms throttle

    return () => {
      if (processSocketNotificationsRef.current) {
        clearTimeout(processSocketNotificationsRef.current);
      }
    };
  }, [processSocketNotifications]);

  const handleOpenChange = (newlyRequestedOpenState: boolean) => {
    if (!newlyRequestedOpenState && preventAutoClose.current) {
      return;
    }

    setIsOpen(newlyRequestedOpenState);

    if (newlyRequestedOpenState) {
      preventAutoClose.current = true;

      if (unreadIds.length > 0) {
        markNotificationsAsRead(unreadIds)
          .catch((error) => {
            console.error("❌ [NotificationModal] Failed to mark notifications as read:", error);
          })
          .finally(() => {
            preventAutoClose.current = false;
            // Workaround: re-open if it was open before
            setIsOpen(true);
          });
      } else {
        preventAutoClose.current = false;
      }
      setNewNotifications(false);
    }
  };

  const unreadNotifications = newNotifications && unreadCount > 0;

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange} data-testid={`sidebar-notification button`}>
      <PopoverTrigger asChild>
        <SidebarMenuButton className="text-muted-foreground h-6" disabled={isLoading}>
          <BellIcon
            className={`h-5 w-5 cursor-pointer ${unreadNotifications ? "text-destructive" : ""} ${isLoading ? "animate-pulse" : ""}`}
          />
          {t(`types.notifications`, { count: 2 })}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent className="relative left-10 w-80 border-0 p-0 shadow-none">
        <Card>
          <CardHeader className="p-4">
            <CardTitle>{t(`types.notifications`, { count: 2 })}</CardTitle>
            {isLoading && <div className="text-muted-foreground text-xs">Loading...</div>}
            {error && <div className="text-destructive text-xs">Error: {error}</div>}
          </CardHeader>
          <Separator />
          <ScrollArea className="h-96">
            {notifications.length > 0 ? (
              notifications.map((notification: NotificationInterface) => (
                <Fragment key={notification.id}>{generateNotification(notification, () => setIsOpen(false))}</Fragment>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                {t(`foundations.notification.empty`, { count: 2 })}
              </div>
            )}
          </ScrollArea>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

export default function NotificationModal(props: NotificationModalProps) {
  return (
    <NotificationErrorBoundary>
      <NotificationModalContent {...props} />
    </NotificationErrorBoundary>
  );
}
