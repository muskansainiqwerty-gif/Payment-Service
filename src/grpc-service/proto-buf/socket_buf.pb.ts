export const SOCKET_PACKAGE_NAME = "socket";

export interface SocketServiceClient {
    verifyNftList(request: any);
    purchaseNft(request: any);
}

export const SOCKET_SERVICE_NAME = "SocketService";
