import http from "@/api";

export interface TrackingEventPayload {
  packageNumber: string;
  trackingDesc: string;
  eventCode?: string;
  locationCode?: string;
  locationName?: string;
  remark?: string;
  eventTime?: string;
}

export const getTrackingByNumber = (trackingNumber: string) => {
  return http.get(`/api/Tracking/${encodeURIComponent(trackingNumber)}`, {}, { loading: false });
};

export const getTrackingByShipmentId = (shipmentId: number | string) => {
  return http.get(`/api/Tracking/Shipment/${shipmentId}`, {}, { loading: false });
};

export const syncTracking = (trackingNumber: string) => {
  return http.post(`/api/Tracking/${encodeURIComponent(trackingNumber)}/Sync`, {});
};

export const addTrackingEvent = (shipmentId: number | string, params: TrackingEventPayload) => {
  return http.post(`/api/Tracking/Shipment/${shipmentId}/Events`, params);
};
