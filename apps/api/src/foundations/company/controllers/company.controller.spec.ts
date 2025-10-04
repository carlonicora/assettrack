import { HttpException, HttpStatus } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { FastifyReply } from "fastify";
import { CacheService } from "src/core/cache/services/cache.service";
import { AuthenticatedRequest } from "src/common/interfaces/authenticated.request.interface";
import { RoleId } from "src/foundations/role/enums/role.id";
import { JsonApiDataInterface } from "src/core/jsonapi/interfaces/jsonapi.data.interface";
import { AdminJwtAuthGuard } from "src/common/guards/jwt.auth.admin.guard";
import { JwtAuthGuard } from "src/common/guards/jwt.auth.guard";
import { CompanyController } from "./company.controller";
import { CompanyService } from "../services/company.service";
import { CompanyPostDTO } from "../dtos/company.post.dto";
import { CompanyPutDTO } from "../dtos/company.put.dto";
import { CompanyLicensePutDTO } from "../dtos/company.license.put.dto";
import { companyMeta } from "../entities/company.meta";

describe("CompanyController", () => {
  let controller: CompanyController;
  let companyService: jest.Mocked<CompanyService>;
  let cacheService: jest.Mocked<CacheService>;
  let mockReply: jest.Mocked<FastifyReply>;

  // Test data constants
  const MOCK_COMPANY_ID = "550e8400-e29b-41d4-a716-446655440000";
  const MOCK_USER_ID = "660e8400-e29b-41d4-a716-446655440001";
  const DIFFERENT_COMPANY_ID = "770e8400-e29b-41d4-a716-446655440002";

  const mockAdminUser = {
    userId: MOCK_USER_ID,
    companyId: MOCK_COMPANY_ID,
    roles: [RoleId.Administrator],
    language: "en",
  };

  const mockCompanyAdminUser = {
    userId: MOCK_USER_ID,
    companyId: MOCK_COMPANY_ID,
    roles: [RoleId.CompanyAdministrator],
    language: "en",
  };

  const mockRegularUser = {
    userId: MOCK_USER_ID,
    companyId: MOCK_COMPANY_ID,
    roles: [],
    language: "en",
  };

  const mockServiceResponse: JsonApiDataInterface = {
    type: "companies",
    id: MOCK_COMPANY_ID,
    attributes: {
      name: "Test Company",
      availableTokens: 1000,
    },
  };

  beforeEach(async () => {
    const mockCompanyService = {
      find: jest.fn(),
      findOne: jest.fn(),
      createForController: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      activateLicense: jest.fn(),
    };

    const mockCacheService = {
      invalidateByType: jest.fn(),
      invalidateByElement: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: mockCompanyService,
        },
        {
          provide: CacheService,
          useValue: mockCacheService,
        },
      ],
    })
      .overrideGuard(AdminJwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompanyController>(CompanyController);
    companyService = module.get(CompanyService);
    cacheService = module.get(CacheService);

    // Mock FastifyReply
    mockReply = {
      send: jest.fn(),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("fetchAllCompanies", () => {
    const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
    const mockQuery = { page: { number: 1, size: 10 } };
    const mockSearch = "test search";

    it("should fetch all companies with search term and query parameters", async () => {
      companyService.find.mockResolvedValue(mockServiceResponse);

      await controller.fetchAllCompanies(mockRequest, mockReply, mockQuery, mockSearch);

      expect(companyService.find).toHaveBeenCalledWith({
        term: mockSearch,
        query: mockQuery,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should fetch all companies without search term", async () => {
      companyService.find.mockResolvedValue(mockServiceResponse);

      await controller.fetchAllCompanies(mockRequest, mockReply, mockQuery);

      expect(companyService.find).toHaveBeenCalledWith({
        term: undefined,
        query: mockQuery,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should handle service errors", async () => {
      const serviceError = new Error("Service error");
      companyService.find.mockRejectedValue(serviceError);

      await expect(controller.fetchAllCompanies(mockRequest, mockReply, mockQuery)).rejects.toThrow("Service error");

      expect(companyService.find).toHaveBeenCalledWith({
        term: undefined,
        query: mockQuery,
      });
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });

  describe("findCompany", () => {
    it("should find company when user is administrator", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      companyService.findOne.mockResolvedValue(mockServiceResponse);

      await controller.findCompany(mockRequest, mockReply, MOCK_COMPANY_ID);

      expect(companyService.findOne).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should find company when user belongs to the same company", async () => {
      const mockRequest = { user: mockRegularUser } as AuthenticatedRequest;
      companyService.findOne.mockResolvedValue(mockServiceResponse);

      await controller.findCompany(mockRequest, mockReply, MOCK_COMPANY_ID);

      expect(companyService.findOne).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should throw unauthorized error when user tries to access different company", async () => {
      const mockRequest = { user: mockRegularUser } as AuthenticatedRequest;

      await expect(controller.findCompany(mockRequest, mockReply, DIFFERENT_COMPANY_ID)).rejects.toThrow(
        new HttpException("Unauthorised", 401),
      );

      expect(companyService.findOne).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
    });

    it("should allow administrator to access any company", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      companyService.findOne.mockResolvedValue(mockServiceResponse);

      await controller.findCompany(mockRequest, mockReply, DIFFERENT_COMPANY_ID);

      expect(companyService.findOne).toHaveBeenCalledWith({
        companyId: DIFFERENT_COMPANY_ID,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
    });

    it("should handle service errors", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const serviceError = new Error("Company not found");
      companyService.findOne.mockRejectedValue(serviceError);

      await expect(controller.findCompany(mockRequest, mockReply, MOCK_COMPANY_ID)).rejects.toThrow(
        "Company not found",
      );

      expect(companyService.findOne).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
      });
      expect(mockReply.send).not.toHaveBeenCalled();
    });
  });

  describe("create", () => {
    const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
    const mockPostDTO: CompanyPostDTO = {
      data: {
        type: "companies",
        id: MOCK_COMPANY_ID,
        attributes: {
          name: "New Test Company",
          availableTokens: 5000,
        },
        relationships: {
          features: { data: [{ type: "features", id: "feature-1" }] },
          modules: { data: [{ type: "modules", id: "module-1" }] },
        },
      },
      included: [],
    };

    it("should create a company successfully", async () => {
      companyService.createForController.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByType.mockResolvedValue();

      await controller.create(mockRequest, mockReply, mockPostDTO);

      expect(companyService.createForController).toHaveBeenCalledWith({
        data: mockPostDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByType).toHaveBeenCalledWith(companyMeta.endpoint);
    });

    it("should create a company without relationships", async () => {
      const postDTOWithoutRelationships: CompanyPostDTO = {
        data: {
          type: "companies",
          id: MOCK_COMPANY_ID,
          attributes: {
            name: "New Test Company",
          },
          relationships: {} as any,
        },
        included: [],
      };

      companyService.createForController.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByType.mockResolvedValue();

      await controller.create(mockRequest, mockReply, postDTOWithoutRelationships);

      expect(companyService.createForController).toHaveBeenCalledWith({
        data: postDTOWithoutRelationships.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByType).toHaveBeenCalledWith(companyMeta.endpoint);
    });

    it("should handle service errors during creation", async () => {
      const serviceError = new Error("Creation failed");
      companyService.createForController.mockRejectedValue(serviceError);

      await expect(controller.create(mockRequest, mockReply, mockPostDTO)).rejects.toThrow("Creation failed");

      expect(companyService.createForController).toHaveBeenCalledWith({
        data: mockPostDTO.data,
      });
      expect(mockReply.send).not.toHaveBeenCalled();
      expect(cacheService.invalidateByType).not.toHaveBeenCalled();
    });

    it("should handle cache invalidation errors", async () => {
      const cacheError = new Error("Cache invalidation failed");
      companyService.createForController.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByType.mockRejectedValue(cacheError);

      await expect(controller.create(mockRequest, mockReply, mockPostDTO)).rejects.toThrow("Cache invalidation failed");

      expect(companyService.createForController).toHaveBeenCalledWith({
        data: mockPostDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByType).toHaveBeenCalledWith(companyMeta.endpoint);
    });
  });

  describe("update", () => {
    const mockPutDTO: CompanyPutDTO = {
      data: {
        type: "companies",
        id: MOCK_COMPANY_ID,
        attributes: {
          name: "Updated Test Company",
          logo: "new-logo.png",
          availableTokens: 2000,
        },
        relationships: {
          features: { data: [{ type: "features", id: "feature-2" }] },
          modules: { data: [{ type: "modules", id: "module-2" }] },
        },
      },
      included: [],
    };

    it("should update company when user is administrator", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      companyService.update.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByElement.mockResolvedValue();

      await controller.update(mockRequest, mockReply, mockPutDTO, MOCK_COMPANY_ID);

      expect(companyService.update).toHaveBeenCalledWith({
        data: mockPutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByElement).toHaveBeenCalledWith(companyMeta.endpoint, MOCK_COMPANY_ID);
    });

    it("should update company when user is company administrator of same company", async () => {
      const mockRequest = { user: mockCompanyAdminUser } as AuthenticatedRequest;
      companyService.update.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByElement.mockResolvedValue();

      await controller.update(mockRequest, mockReply, mockPutDTO, MOCK_COMPANY_ID);

      expect(companyService.update).toHaveBeenCalledWith({
        data: mockPutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByElement).toHaveBeenCalledWith(companyMeta.endpoint, MOCK_COMPANY_ID);
    });

    it("should throw unauthorized error when company admin tries to update different company", async () => {
      const mockRequest = { user: mockCompanyAdminUser } as AuthenticatedRequest;

      await expect(controller.update(mockRequest, mockReply, mockPutDTO, DIFFERENT_COMPANY_ID)).rejects.toThrow(
        new HttpException("Unauthorised", 401),
      );

      expect(companyService.update).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
      expect(cacheService.invalidateByElement).not.toHaveBeenCalled();
    });

    it("should throw precondition failed error when path ID does not match body ID", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const mismatchedPutDTO: CompanyPutDTO = {
        data: {
          ...mockPutDTO.data,
          id: DIFFERENT_COMPANY_ID,
        },
        included: [],
      };

      await expect(controller.update(mockRequest, mockReply, mismatchedPutDTO, MOCK_COMPANY_ID)).rejects.toThrow(
        new HttpException("Company Id does not match the {json:api} id", HttpStatus.PRECONDITION_FAILED),
      );

      expect(companyService.update).not.toHaveBeenCalled();
      expect(mockReply.send).not.toHaveBeenCalled();
      expect(cacheService.invalidateByElement).not.toHaveBeenCalled();
    });

    it("should allow administrator to update any company", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const differentCompanyPutDTO: CompanyPutDTO = {
        data: {
          ...mockPutDTO.data,
          id: DIFFERENT_COMPANY_ID,
        },
        included: [],
      };
      companyService.update.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByElement.mockResolvedValue();

      await controller.update(mockRequest, mockReply, differentCompanyPutDTO, DIFFERENT_COMPANY_ID);

      expect(companyService.update).toHaveBeenCalledWith({
        data: differentCompanyPutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByElement).toHaveBeenCalledWith(companyMeta.endpoint, DIFFERENT_COMPANY_ID);
    });

    it("should handle service errors during update", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const serviceError = new Error("Update failed");
      companyService.update.mockRejectedValue(serviceError);

      await expect(controller.update(mockRequest, mockReply, mockPutDTO, MOCK_COMPANY_ID)).rejects.toThrow(
        "Update failed",
      );

      expect(companyService.update).toHaveBeenCalledWith({
        data: mockPutDTO.data,
      });
      expect(mockReply.send).not.toHaveBeenCalled();
      expect(cacheService.invalidateByElement).not.toHaveBeenCalled();
    });

    it("should handle cache invalidation errors", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const cacheError = new Error("Cache invalidation failed");
      companyService.update.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByElement.mockRejectedValue(cacheError);

      await expect(controller.update(mockRequest, mockReply, mockPutDTO, MOCK_COMPANY_ID)).rejects.toThrow(
        "Cache invalidation failed",
      );

      expect(companyService.update).toHaveBeenCalledWith({
        data: mockPutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByElement).toHaveBeenCalledWith(companyMeta.endpoint, MOCK_COMPANY_ID);
    });
  });

  describe("delete", () => {
    it("should delete company successfully", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      companyService.delete.mockResolvedValue();
      cacheService.invalidateByElement.mockResolvedValue();

      await controller.delete(mockRequest, mockReply, MOCK_COMPANY_ID);

      expect(companyService.delete).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
      });
      expect(mockReply.send).toHaveBeenCalledWith();
      expect(cacheService.invalidateByElement).toHaveBeenCalledWith(companyMeta.endpoint, MOCK_COMPANY_ID);
    });

    it("should handle service errors during deletion", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const serviceError = new Error("Deletion failed");
      companyService.delete.mockRejectedValue(serviceError);

      await expect(controller.delete(mockRequest, mockReply, MOCK_COMPANY_ID)).rejects.toThrow("Deletion failed");

      expect(companyService.delete).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
      });
      expect(mockReply.send).not.toHaveBeenCalled();
      expect(cacheService.invalidateByElement).not.toHaveBeenCalled();
    });

    it("should handle cache invalidation errors", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const cacheError = new Error("Cache invalidation failed");
      companyService.delete.mockResolvedValue();
      cacheService.invalidateByElement.mockRejectedValue(cacheError);

      await expect(controller.delete(mockRequest, mockReply, MOCK_COMPANY_ID)).rejects.toThrow(
        "Cache invalidation failed",
      );

      expect(companyService.delete).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
      });
      expect(mockReply.send).toHaveBeenCalledWith();
      expect(cacheService.invalidateByElement).toHaveBeenCalledWith(companyMeta.endpoint, MOCK_COMPANY_ID);
    });
  });

  describe("activateLicense", () => {
    const mockLicensePutDTO: CompanyLicensePutDTO = {
      data: {
        type: "companies",
        id: MOCK_COMPANY_ID,
        attributes: {
          license: "test-license-key",
          privateKey: "test-private-key",
        },
      },
      included: [],
    };

    it("should activate license when user is administrator", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      companyService.activateLicense.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByType.mockResolvedValue();

      await controller.activateLicense(mockRequest, mockReply, MOCK_COMPANY_ID, mockLicensePutDTO);

      expect(companyService.activateLicense).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
        data: mockLicensePutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByType).toHaveBeenCalledWith(companyMeta.endpoint);
    });

    it("should activate license when user is company administrator of same company", async () => {
      const mockRequest = { user: mockCompanyAdminUser } as AuthenticatedRequest;
      companyService.activateLicense.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByType.mockResolvedValue();

      await controller.activateLicense(mockRequest, mockReply, MOCK_COMPANY_ID, mockLicensePutDTO);

      expect(companyService.activateLicense).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
        data: mockLicensePutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByType).toHaveBeenCalledWith(companyMeta.endpoint);
    });

    it("should handle service errors during license activation", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const serviceError = new Error("License activation failed");
      companyService.activateLicense.mockRejectedValue(serviceError);

      await expect(
        controller.activateLicense(mockRequest, mockReply, MOCK_COMPANY_ID, mockLicensePutDTO),
      ).rejects.toThrow("License activation failed");

      expect(companyService.activateLicense).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
        data: mockLicensePutDTO.data,
      });
      expect(mockReply.send).not.toHaveBeenCalled();
      expect(cacheService.invalidateByType).not.toHaveBeenCalled();
    });

    it("should handle cache invalidation errors", async () => {
      const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
      const cacheError = new Error("Cache invalidation failed");
      companyService.activateLicense.mockResolvedValue(mockServiceResponse);
      cacheService.invalidateByType.mockRejectedValue(cacheError);

      await expect(
        controller.activateLicense(mockRequest, mockReply, MOCK_COMPANY_ID, mockLicensePutDTO),
      ).rejects.toThrow("Cache invalidation failed");

      expect(companyService.activateLicense).toHaveBeenCalledWith({
        companyId: MOCK_COMPANY_ID,
        data: mockLicensePutDTO.data,
      });
      expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      expect(cacheService.invalidateByType).toHaveBeenCalledWith(companyMeta.endpoint);
    });
  });

  describe("Edge Cases and Additional Scenarios", () => {
    describe("Authorization Edge Cases", () => {
      it("should handle user with empty roles array", async () => {
        const userWithNoRoles = {
          userId: MOCK_USER_ID,
          companyId: MOCK_COMPANY_ID,
          roles: [],
          language: "en",
        };
        const mockRequest = { user: userWithNoRoles } as AuthenticatedRequest;

        await expect(controller.findCompany(mockRequest, mockReply, DIFFERENT_COMPANY_ID)).rejects.toThrow(
          new HttpException("Unauthorised", 401),
        );
      });

      it("should handle user with null/undefined roles", async () => {
        const userWithNullRoles = {
          userId: MOCK_USER_ID,
          companyId: MOCK_COMPANY_ID,
          roles: null as any,
          language: "en",
        };
        const mockRequest = { user: userWithNullRoles } as AuthenticatedRequest;

        await expect(controller.findCompany(mockRequest, mockReply, DIFFERENT_COMPANY_ID)).rejects.toThrow();
      });

      it("should handle multiple roles including administrator", async () => {
        const userWithMultipleRoles = {
          userId: MOCK_USER_ID,
          companyId: MOCK_COMPANY_ID,
          roles: [RoleId.CompanyAdministrator, RoleId.Administrator],
          language: "en",
        };
        const mockRequest = { user: userWithMultipleRoles } as AuthenticatedRequest;
        companyService.findOne.mockResolvedValue(mockServiceResponse);

        await controller.findCompany(mockRequest, mockReply, DIFFERENT_COMPANY_ID);

        expect(companyService.findOne).toHaveBeenCalledWith({
          companyId: DIFFERENT_COMPANY_ID,
        });
        expect(mockReply.send).toHaveBeenCalledWith(mockServiceResponse);
      });
    });

    describe("Input Validation Edge Cases", () => {
      it("should handle empty query parameters in fetchAllCompanies", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        const emptyQuery = {};
        companyService.find.mockResolvedValue(mockServiceResponse);

        await controller.fetchAllCompanies(mockRequest, mockReply, emptyQuery);

        expect(companyService.find).toHaveBeenCalledWith({
          term: undefined,
          query: emptyQuery,
        });
      });

      it("should handle empty string search parameter", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        const mockQuery = { page: { number: 1, size: 10 } };
        const emptySearch = "";
        companyService.find.mockResolvedValue(mockServiceResponse);

        await controller.fetchAllCompanies(mockRequest, mockReply, mockQuery, emptySearch);

        expect(companyService.find).toHaveBeenCalledWith({
          term: emptySearch,
          query: mockQuery,
        });
      });

      it("should handle special characters in company ID", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        const specialCharId = "company-with-dashes-123";
        companyService.findOne.mockResolvedValue(mockServiceResponse);

        await controller.findCompany(mockRequest, mockReply, specialCharId);

        expect(companyService.findOne).toHaveBeenCalledWith({
          companyId: specialCharId,
        });
      });
    });

    describe("Service Response Edge Cases", () => {
      it("should handle empty service response in fetchAllCompanies", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        const mockQuery = { page: { number: 1, size: 10 } };
        const emptyResponse: JsonApiDataInterface = {
          type: "companies",
          id: "empty",
          attributes: {},
        };
        companyService.find.mockResolvedValue(emptyResponse);

        await controller.fetchAllCompanies(mockRequest, mockReply, mockQuery);

        expect(companyService.find).toHaveBeenCalledWith({
          term: undefined,
          query: mockQuery,
        });
        expect(mockReply.send).toHaveBeenCalledWith(emptyResponse);
      });

      it("should handle null service response", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        companyService.findOne.mockResolvedValue(null);

        await controller.findCompany(mockRequest, mockReply, MOCK_COMPANY_ID);

        expect(companyService.findOne).toHaveBeenCalledWith({
          companyId: MOCK_COMPANY_ID,
        });
        expect(mockReply.send).toHaveBeenCalledWith(null);
      });
    });

    describe("Concurrent Operations", () => {
      it("should handle concurrent cache invalidation calls", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        const mockPostDTO: CompanyPostDTO = {
          data: {
            type: "companies",
            id: MOCK_COMPANY_ID,
            attributes: {
              name: "Concurrent Test Company",
            },
            relationships: {} as any,
          },
          included: [],
        };

        companyService.createForController.mockResolvedValue(mockServiceResponse);
        cacheService.invalidateByType.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

        const promise1 = controller.create(mockRequest, mockReply, mockPostDTO);
        const promise2 = controller.create(mockRequest, mockReply, mockPostDTO);

        await Promise.all([promise1, promise2]);

        expect(cacheService.invalidateByType).toHaveBeenCalledTimes(2);
      });
    });

    describe("HTTP Status Code Verification", () => {
      it("should return 204 No Content for successful deletion", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        companyService.delete.mockResolvedValue();
        cacheService.invalidateByElement.mockResolvedValue();

        await controller.delete(mockRequest, mockReply, MOCK_COMPANY_ID);

        // The @HttpCode(HttpStatus.NO_CONTENT) decorator ensures 204 status
        expect(mockReply.send).toHaveBeenCalledWith();
      });

      it("should throw 401 Unauthorized for access violations", async () => {
        const mockRequest = { user: mockRegularUser } as AuthenticatedRequest;

        await expect(controller.findCompany(mockRequest, mockReply, DIFFERENT_COMPANY_ID)).rejects.toThrow(
          new HttpException("Unauthorised", 401),
        );
      });

      it("should throw 412 Precondition Failed for ID mismatch", async () => {
        const mockRequest = { user: mockAdminUser } as AuthenticatedRequest;
        const mismatchedPutDTO: CompanyPutDTO = {
          data: {
            type: "companies",
            id: DIFFERENT_COMPANY_ID,
            attributes: {
              name: "Test Company",
            },
            relationships: {} as any,
          },
          included: [],
        };

        await expect(controller.update(mockRequest, mockReply, mismatchedPutDTO, MOCK_COMPANY_ID)).rejects.toThrow(
          new HttpException("Company Id does not match the {json:api} id", HttpStatus.PRECONDITION_FAILED),
        );
      });
    });
  });
});
