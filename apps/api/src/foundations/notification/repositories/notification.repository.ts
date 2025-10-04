import { Injectable, OnModuleInit } from "@nestjs/common";
import { randomUUID } from "crypto";
import { JsonApiCursorInterface } from "src/core/jsonapi/interfaces/jsonapi.cursor.interface";
import { Neo4jService } from "src/core/neo4j/services/neo4j.service";
import { Notification } from "src/foundations/notification/entities/notification.entity";
import { NotificationModel } from "src/foundations/notification/entities/notification.model";

@Injectable()
export class NotificationRepository implements OnModuleInit {
  constructor(private readonly neo4j: Neo4jService) {}

  async onModuleInit() {
    await this.neo4j.writeOne({
      query: `CREATE CONSTRAINT notification_id IF NOT EXISTS FOR (notification:Notification) REQUIRE notification.id IS UNIQUE`,
    });
  }

  async find(params: {
    userId: string;
    cursor?: JsonApiCursorInterface;
    isArchived?: boolean;
  }): Promise<Notification[]> {
    const query = this.neo4j.initQuery({ serialiser: NotificationModel, cursor: params.cursor });

    query.queryParams = {
      ...query.queryParams,
      userId: params.userId,
    };

    query.query += `
      MATCH (notification:Notification)-[:BELONGS_TO]->(company)
      MATCH (notification)-[:TRIGGERED_FOR]->(user:User {id: $userId})-[:BELONGS_TO]->(company)
      WHERE EXISTS { MATCH (notification)-[:REFERS_TO]->() }
      ${params.isArchived ? `AND notification.isArchived = true` : "AND notification.isArchived IS null"}
      
      WITH notification
      ORDER BY notification.createdAt DESC
      {CURSOR}
      
      
      MATCH (notification)-[:TRIGGERED_BY]->(notification_user:User)

      RETURN notification, notification_user
    `;

    return this.neo4j.readMany(query);
  }

  async findById(params: { notificationId: string; userId: string }): Promise<Notification> {
    const query = this.neo4j.initQuery({ serialiser: NotificationModel });

    query.queryParams = {
      ...query.queryParams,
      notificationId: params.notificationId,
      userId: params.userId,
    };

    query.query += `
      MATCH (notification:Notification {id: $notificationId})-[:BELONGS_TO]->(company)
      MATCH (notification)-[:TRIGGERED_BY]->(notification_user:User)

      RETURN notification, notification_user
    `;

    return this.neo4j.readOne(query);
  }

  async markAsRead(params: { userId: string; notificationIds: string[] }) {
    const query = this.neo4j.initQuery({ serialiser: NotificationModel });

    query.queryParams = {
      ...query.queryParams,
      userId: params.userId,
      notificationIds: params.notificationIds,
    };

    query.query += `
      MATCH (notification:Notification)-[:BELONGS_TO]->(company)
      WHERE notification.id IN $notificationIds
      MATCH (notification)-[:TRIGGERED_FOR]->(user:User {id: $userId})
      SET notification.isRead = true
    `;

    await this.neo4j.writeOne(query);
  }

  async archive(params: { notificationId: string }) {
    const query = this.neo4j.initQuery({ serialiser: NotificationModel });

    query.queryParams = {
      ...query.queryParams,
      notificationId: params.notificationId,
    };

    query.query += `
      MATCH (notification:Notification {id: $notificationId})-[:BELONGS_TO]->(company)
      SET notification.isArchived = true, notification.updatedAt = datetime()
    `;

    await this.neo4j.writeOne(query);
  }

  async create(params: { type: string; userId: string; actorId?: string }): Promise<Notification> {
    const query = this.neo4j.initQuery();

    const notificationId: string = randomUUID();

    query.queryParams = {
      ...query.queryParams,
      notificationId: notificationId,
      type: params.type,
      userId: params.userId,
      actorId: params.actorId,
    };

    query.query += `
      MATCH (user:User {id: $userId})-[:BELONGS_TO]->(company)
      ${params.actorId ? `MATCH (actor:User {id: $actorId})-[:BELONGS_TO]->(company)` : ""}

      CREATE (notification)-[:BELONGS_TO]->(company)
      CREATE (notification)-[:TRIGGERED_FOR]->(user)
      ${params.actorId ? `CREATE (notification)-[:TRIGGERED_BY]->(actor)` : ""}
    `;

    await this.neo4j.writeOne(query);
    return this.findById({ notificationId: notificationId, userId: params.userId });
  }
}
