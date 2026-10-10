/** Explicit refusal until a reviewed backing service is configured and observed. */
export function unboundCapability(component) {
  if(!['public-domain-registration','remote-software-ingestion'].includes(component))throw new TypeError('UNKNOWN_COMPONENT');
  return {statusCode:503,body:{ok:false,status:'BLOCKED',component,error:'VERIFIED_BACKING_SERVICE_UNBOUND',registered:false,connected:false}};
}
