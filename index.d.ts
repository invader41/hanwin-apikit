export declare class HanwinApiClient {
  token: string;
  baseUrl: string;
  request(hanwinApiRequest: HanwinApiRequest): Promise<any>;
  constructor(config: string | IHanwinApiClientConfig);
}

export declare class HanwinOAuthApiClient extends HanwinApiClient {
  requestToken();
  constructor(IHanwinOAuthApiClientConfig);
}

export declare interface IHanwinOAuthApiClientConfig
  extends IHanwinApiClientConfig {
  tokenUrl: string;
  credentialsProvider: () => any;
}

export declare interface IHanwinApiClientConfig {
  baseUrl: string;
  assignDigest: () => string;
  onBusinessError: (model: any) => void;
  onUnauthorized: (response: Response) => void;
  isTokenExp: (token: string) => boolean;
  onTokenExp: (request: HanwinApiRequest) => void;
}

export declare class HanwinApiRequest {
  url: string;
  urlSearchParams: URLSearchParams;
  headers: Headers;
  body: URLSearchParams | any;
  method: string;
  verifyModel: boolean;
  get(): HanwinApiRequest;
  post(): HanwinApiRequest;
  search(urlSearchParams): HanwinApiRequest;
  headers(headers): HanwinApiRequest;
  data(data): HanwinApiRequest;
  verifyModel(verifyModel): HanwinApiRequest;
  constructor(url: string);
}
