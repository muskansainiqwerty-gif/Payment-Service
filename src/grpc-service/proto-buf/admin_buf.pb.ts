export const ADMIN_PACKAGE_NAME = "admin";

export interface AdminServiceClient {
  setFee(request: any);
  countrycheck(request: any)
  allcountry(request: any)
  getmaintenance(request: any)
}

export const ADMIN_SERVICE_NAME = "AdminService";
