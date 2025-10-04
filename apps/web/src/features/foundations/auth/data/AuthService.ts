// import { authLogin, saveToken } from "@/lib/auth/Auth";
import { AbstractService, HttpMethod } from "@/data/abstracts/AbstractService";
import { EndpointCreator } from "@/data/EndpointCreator";
import { AuthInput, AuthInterface } from "@/features/foundations/auth/data/AuthInterface";
import { removeToken, updateToken } from "@/features/foundations/auth/utils/AuthCookies";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { ApiResponseInterface } from "@/jsonApi/interfaces/ApiResponseInterface";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { JsonApiDelete, JsonApiGet, JsonApiPost } from "@/jsonApi/JsonApiRequest";
import { rehydrate } from "@/jsonApi/Rehydrator";
import { Modules } from "@/modules/modules";

export class AuthService extends AbstractService {

  static async saveToken(params: { dehydratedAuth: JsonApiHydratedDataInterface }) {
    "use client";
    const auth: AuthInterface = rehydrate(Modules.Auth, params.dehydratedAuth) as AuthInterface;

    await this._saveToken({ auth: auth });
  }

  private static async _saveToken(params: { auth: AuthInterface }): Promise<void> {
    const token = {
      token: params.auth.token,
      refreshToken: params.auth.refreshToken,
      userId: params.auth.user.id,
      companyId: params.auth.user.company?.id,
      licenseExpirationDate: params.auth.user.company?.licenseExpirationDate,
      roles: params.auth.user.roles.map((role) => role.id),
      features: params.auth.user.company?.features?.map((feature) => feature.id) ?? [],
      modules: params.auth.user.modules.map((module) => {
        return { id: module.id, permissions: module.permissions };
      }),
    };

    await updateToken(token);
  }

  static async login(params: { email: string; password: string }): Promise<UserInterface> {
    const language = navigator.language || "en-US";

    const apiResponse: ApiResponseInterface = await JsonApiPost({
      classKey: Modules.Auth,
      endpoint: new EndpointCreator({ endpoint: Modules.Auth, id: "login" }).generate(),
      body: { email: params.email, password: params.password } as AuthInput,
      language: language,
    });

    if (!apiResponse.ok) throw new Error(apiResponse.error);

    const auth: AuthInterface = apiResponse.data as AuthInterface;
    await this._saveToken({ auth: auth });

    return auth.user;
  }

  static async logout(): Promise<void> {
    const language = navigator.language || "en-US";

    await JsonApiDelete({
      classKey: Modules.Auth,
      endpoint: new EndpointCreator({ endpoint: Modules.Auth }).generate(),
      language: language,
    });
    await removeToken();
  }

  static async initialiseForgotPassword(params: { email: string }): Promise<void> {
    const language = navigator.language || "en-US";

    const response: ApiResponseInterface = await JsonApiPost({
      classKey: Modules.Auth,
      endpoint: new EndpointCreator({ endpoint: Modules.Auth, id: "forgot" }).generate(),
      body: { email: params.email } as AuthInput,
      language: language,
    });

    if (!response.ok) {
      throw new Error(response.error);
    }
  }

  static async register(params: AuthInput): Promise<void> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Auth, id: "register" });

    await this.callApi({
      type: Modules.Auth,
      method: HttpMethod.POST,
      endpoint: endpoint.generate(),
      input: params,
    });
  }

  static async activate(params: { activationCode: string }): Promise<void> {
    const endpoint = new EndpointCreator({
      endpoint: Modules.Auth,
      id: "activate",
      childEndpoint: params.activationCode,
    });

    await this.callApi({ type: Modules.Auth, method: HttpMethod.POST, endpoint: endpoint.generate() });
  }

  static async validateCode(params: { code: string }): Promise<void> {
    const language = navigator.language || "en-US";

    const apiResponse: ApiResponseInterface = await JsonApiGet({
      classKey: Modules.Auth,
      endpoint: new EndpointCreator({ endpoint: Modules.Auth, id: "validate", childEndpoint: params.code }).generate(),
      language: language,
    });

    if (!apiResponse.ok) throw new Error(apiResponse.error);
  }

  static async resetPassword(params: { code: string; password: string }): Promise<void> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Auth, id: "reset", childEndpoint: params.code });

    const input: AuthInput = { password: params.password };

    await this.callApi({ type: Modules.Auth, method: HttpMethod.POST, endpoint: endpoint.generate(), input: input });
  }

  static async acceptInvitation(params: { code: string; password: string }): Promise<void> {
    const endpoint = new EndpointCreator({ endpoint: Modules.Auth, id: "invitation", childEndpoint: params.code });

    const input: AuthInput = { password: params.password };

    await this.callApi({ type: Modules.Auth, method: HttpMethod.POST, endpoint: endpoint.generate(), input: input });
  }

  static async findToken(params: { tokenCode: string }): Promise<AuthInterface> {
    return await this.callApi<AuthInterface>({
      type: Modules.Auth,
      method: HttpMethod.POST,
      endpoint: new EndpointCreator({ endpoint: Modules.Auth }).addAdditionalParam("code", params.tokenCode).generate(),
    });
  }
}
