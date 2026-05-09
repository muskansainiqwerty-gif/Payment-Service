export const CRYPTO_GRPC_PACKAGE = "crypto";

export interface CryptoServiceClient {
    getaddress(request: any);
    validateWalletAddress(request: any)
}

export const CRYPTO_GRPC_SERVICE = "Cryptoservice";
