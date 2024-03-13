const axios = require('axios');
const fs = require('fs');

const zoho_refresh_token = async() => {
    const consumir = axios.create({ baseURL: process.env.ZOHO_URL });
    try {

        let jsonResult = {
            success: false,
            message: '',
            token: '',
            expires_in: 0
        };
        jsonResult = await consumir.post('/oauth/v2/token', null, {
            params: {
                refresh_token: process.env.REFRESH_TOKEN,
                client_id: process.env.CLIENTE_ID,
                client_secret: process.env.CLIENTE_SECRET,
                grant_type: process.env.GRANT_TYPE
            }
        }).then((response) => {

            const { data } = response;
            if (!data.error) {
                jsonResult.success = true;
                jsonResult.message = 'Consulta exitosa.';
                jsonResult.token = data.access_token;
                jsonResult.expires_in = data.expires_in
            } else {
                jsonResult.success = false;
                jsonResult.message = `zoho-${data.error}`;
                jsonResult.token = '';
                expires_in = 0;
            }
            return jsonResult;

        }).catch((error) => {
            const { data } = error.response;
            jsonResult.success = false;
            jsonResult.message = data.message;
            jsonResult.token = '';
            expires_in = 0;
            return jsonResult;
        });

        return jsonResult;

    } catch (e) {
        return {
            success: false,
            message: `${e}`,
            token: '',
            expires_in: 0
        };
    }

};

const zoho_refresh_token_wd = async() => {
    const consumir = axios.create({ baseURL: process.env.ZOHO_URL });
    try {

        let jsonResult = {
            success: false,
            message: '',
            token: '',
            expires_in: 0
        };
        jsonResult = await consumir.post('/oauth/v2/token', null, {
            params: {
                refresh_token: process.env.REFRESH_TOKEN,
                client_id: process.env.CLIENTE_ID,
                client_secret: process.env.CLIENTE_SECRET,
                grant_type: process.env.GRANT_TYPE
            }
        }).then((response) => {

            const { data } = response;

            if (!data.error) {
                jsonResult.success = true;
                jsonResult.message = 'Consulta exitosa.';
                jsonResult.token = data.access_token;
                jsonResult.expires_in = data.expires_in
            } else {
                jsonResult.success = false;
                jsonResult.message = data.error;
                jsonResult.token = '';
                expires_in = 0;
            }
            return jsonResult;

        }).catch((error) => {
            const { data } = error.response;
            jsonResult.success = false;
            jsonResult.message = `zoho-${data.error}`;
            jsonResult.token = '';
            expires_in = 0;
            return jsonResult;
        });

        return jsonResult;

    } catch (e) {
        return {
            success: false,
            message: `${e}`,
            token: '',
            expires_in: 0
        };
    }

};


const seconds_to_string = (seconds) => {

    var hour = Math.floor(seconds / 3600);
    hour = (hour < 10) ? '0' + hour : hour;
    var minute = Math.floor((seconds / 60) % 60);
    minute = (minute < 10) ? '0' + minute : minute;
    var second = seconds % 60;
    second = (second < 10) ? '0' + second : second;
    return hour + ':' + minute + ':' + second;

}

module.exports = {
    zoho_refresh_token,
    zoho_refresh_token_wd,
    seconds_to_string
}