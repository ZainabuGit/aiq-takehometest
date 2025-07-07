
const BASE_URL = "http://nest-api-env.eba-uw5jdqh6.us-east-1.elasticbeanstalk.com";

export const API_ENDPOINTS = {
    FETCH_PLANTS: (state, top) => `${BASE_URL}/powerplants?state=${state}&top=${top}`,
    UPLOAD_FILE: `${BASE_URL}/upload/uploadtoS3`,
    SYNC_FROM_S3: (key = "key") => `${BASE_URL}/upload/uploadFromS3?key=${key}`,
    FETCH_STATES: `${BASE_URL}/powerplants/states`,
    BASE: `${BASE_URL}`,
    REFRESH_TOKEN: `${BASE_URL}/auth/refresh`
};