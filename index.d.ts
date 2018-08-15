export declare class HanwinApiClient {
  token: string;
  baseUrl: string;
  request(hanwinApiRequest: HanwinApiRequest): Promise<any>;
  constructor(config: string | IHanwinApiClientConfig);
}

// export declare class HanwinOAuthApiClient extends HanwinApiClient {
//   requestToken();
//   constructor(IHanwinOAuthApiClientConfig);
// }

// export declare interface IHanwinOAuthApiClientConfig
//   extends IHanwinApiClientConfig {
//   tokenUrl: string;
//   credentialsProvider: () => any;
// }

export declare interface IHanwinApiClientConfig {
  mode?: string;
  baseUrl: string;
  tokenScheme?: string;
  commonHeader?: () => any;
  onBusinessError?: (model: any) => void;
  onUnauthorized?: (response: Response) => void;
  isTokenExp?: (token: string) => boolean;
  onTokenExp?: (request: HanwinApiRequest) => void;
}

export declare class HanwinApiRequest {
  config: IHanwinApiRequestConfig;
  get(): HanwinApiRequest;
  post(): HanwinApiRequest;
  search(urlSearchParams): HanwinApiRequest;
  headers(headers): HanwinApiRequest;
  data(data): HanwinApiRequest;
  verifyModel(verifyModel): HanwinApiRequest;
  constructor(url: string);
}

export declare interface IHanwinApiRequestConfig {
  url: string;
  urlSearchParams: URLSearchParams;
  headers: any;
  body: URLSearchParams | any;
  method: string;
  verifyModel: boolean;
}

export declare class JWTToken {
  constructor(token: string);
  payload: any;
  isExpired(offsetSeconds?): boolean;
}
