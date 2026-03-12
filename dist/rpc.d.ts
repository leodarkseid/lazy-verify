export declare class EthRPC {
    private rpcManager;
    constructor(chainId: number);
    call(method: string, params: any[]): Promise<any>;
    getCode(address: string): Promise<string>;
    getStorageAt(address: string, slot: string): Promise<string>;
}
