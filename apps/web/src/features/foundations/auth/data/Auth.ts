import { EndpointCreator } from "@/data/EndpointCreator";
import { AuthInput, AuthInterface, AuthQuery } from "@/features/foundations/auth/data/AuthInterface";
import { UserInterface } from "@/features/foundations/user/data/UserInterface";
import { AbstractApiData } from "@/jsonApi/abstracts/AbstractApiData";
import { JsonApiHydratedDataInterface } from "@/jsonApi/interfaces/JsonApiHydratedDataInterface";
import { Modules } from "@/modules/modules";

export class Auth extends AbstractApiData implements AuthInterface {
  private _token?: string;
  private _refreshToken?: string;
  private _user?: UserInterface;

  get token(): string {
    if (!this._token) throw new Error("Token is not defined");
    return this._token;
  }

  get refreshToken(): string {
    if (!this._refreshToken) throw new Error("Refresh token is not defined");
    return this._refreshToken;
  }

  get user(): UserInterface {
    if (!this._user) throw new Error("User is not defined");
    return this._user;
  }

  rehydrate(data: JsonApiHydratedDataInterface): this {
    super.rehydrate(data);

    this._token = data.jsonApi.attributes.token ?? undefined;
    this._refreshToken = data.jsonApi.attributes.refreshToken ?? undefined;

    this._user = this._readIncluded(data, "user", Modules.User) as UserInterface;

    return this;
  }

  createJsonApi(data: AuthInput) {
    const response: any = {
      data: {
        type: Modules.Auth.name,
        attributes: {},
      },
    };

    if (data.id) response.data.id = data.id;
    if (data.email !== undefined) response.data.attributes.email = data.email;
    if (data.name !== undefined) response.data.attributes.name = data.name;
    if (data.companyName !== undefined) response.data.attributes.companyName = data.companyName;
    if (data.password !== undefined) response.data.attributes.password = data.password;
    if (data.partitaIva !== undefined) response.data.attributes.partitaIva = data.partitaIva;
    if (data.codiceFiscale !== undefined) response.data.attributes.codiceFiscale = data.codiceFiscale;

    return response;
  }

  generateApiUrl(params?: AuthQuery): string {
    const response = new EndpointCreator({ endpoint: Modules.Auth });

    if (params?.tokenCode) {
      response.addAdditionalParam("code", params.tokenCode);
      return response.generate();
    }

    if (params?.refreshToken) return response.childEndpoint("refreshtoken").childId(params.refreshToken).generate();
    if (params?.login) return response.childEndpoint("login").generate();
    if (params?.forgot) return response.childEndpoint("forgot").generate();
    if (params?.code) return response.childEndpoint("reset").childId(params.code).generate();
    if (params?.activationCode) return response.childEndpoint("activate").childId(params.activationCode).generate();
    if (params?.checkUsername) return response.id(params.checkUsername).generate();

    return response.generate();
  }
}
