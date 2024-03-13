const jwt = require('jsonwebtoken');
const axios = require('axios');
const { request, response } = require('express');
const { zoho_refresh_token } = require('../helpers/zoho-token');

const urls = [{
    name: 'crm_contact',
    url: 'https://www.zohoapis.com/crm/v2/Contacts/'
}];



const fn_generateJWT = async(email) => {

    const tkn = await zoho_refresh_token();
    if(tkn.success){
        return new Promise((resolve, reject) => {
            const payload = { email, token: tkn.token };
            jwt.sign(payload, process.env.SECRETKEY, {
                expiresIn: '1h'
            }, (error, token) => {
                if (error) {
                    console.log(error);
                    reject('No se pudo generar el token.');
                } else {
                    resolve(token);
                }
            })
        })

    }
    else{

        return new Promise((resolve, reject) => {
            reject('No se pudo generar el token.');
        })

    }
    
};



const fn_validateJWTProvO = async(req = request, res = response, next) => {

    try {
        const permiso = req.header('permiso');
        const proveedor = req.header('proveedor');
        const { id, token, tokenF } = jwt.verify(permiso, process.env.SECRETKEY);
        if ( id === 'proveedor@correo.com' && proveedor === 'verificador' ) {
            req.email = {
                id,
                token,
                tokenF
            };
            next();
        } else {
            return res.status(401).json({
                message: 'V-JWT the token is not valid',
                data: {}
            })
        }
    } catch (errorTry) {
        res.status(500).json({
            message: `[J-WT] ${errorTry}`,
            data: []
        });
    }

};

const fn_validateJWTProv1 = async(req = request, res = response, next) => {

    try {
        const permiso = req.header('permiso');
        const proveedor = req.header('proveedor');
        const { id } = jwt.verify(permiso, process.env.SECRETKEY);
        if ( id === 'proveedorfinal@correo.com' && proveedor === 'fabricante' ) {
            req.email = {
                id
            };
            next();
        } else {
            return res.status(401).json({
                message: 'V-JWT the token is not valid',
                data: {}
            })
        }

    } catch (errorTry) {
        res.status(500).json({
            message: `[J-WT] ${errorTry}`,
            data: []
        });
    }

};

const fn_validateJWT = async(req = request, res = response, next) => {

    try {
        const permiso = req.header('permiso');
        if (!permiso) {
            return res.status(401).json({
                mensaje: 'V-JWT: Esta ruta requiere permisos.',
                datos: []
            });
        }
        const { email } = jwt.verify(permiso, process.env.SECRETKEY);
        const { success, token, message } = await zoho_refresh_token_crm();
        if (success) {
            const crm_contact = urls.find(e => e.name === 'crm_contact');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get(`search?email=${email}`);
            if (jsonResult.status === 204) {
                return res.status(400).json({
                    message: `zoho-the email does not exist in the database`,
                    data: {}
                });
            }
            const contact = jsonResult.data.data.find(e => e.Email === email);
            if (!contact.Acceso_App) {
                return res.status(400).json({
                    message: 'zoho-you still do not have access',
                    data: {}
                });
            }
            req.contact = {
                id: contact.id,
                id_cliente: contact.id_cliente,
                email: contact.Email,
                full_name: contact.Full_Name,
                first_name: contact.First_Name,
                last_name: contact.Last_Name
            };
            next();
        } else {
            return res.status(401).json({
                message: 'V-JWT the token is not valid',
                data: {}
            })
        }

    } catch (errorTry) {

        res.status(500).json({
            mensaje: `[J-WT] ${errorTry}`,
            datos: []
        });

    }

};



const fn_validateJWTProv = async(req = request, res = response, next) => {

    try {
        const permiso = req.header('permiso');
        const proveedor = req.header('proveedor');
        const { email, token, exp } = jwt.verify(permiso, process.env.SECRETKEY);
        let currentTime = new Date();
        let currentTimeInt = Math.floor(currentTime.getTime()/1000);
        
        if(currentTimeInt > (exp - 100)){
            if ( email === 'proveedor@correo.com' && proveedor === 'verificador' ) {
                const permisoActual = fn_generateJWT(email);
                req.email = {
                    email,
                    proveedor,
                    tokenZoho: token,
                    permiso: permisoActual
                };
                next();
            } else {
                return res.status(401).json({
                    message: 'V-JWT the token is not valid',
                    data: {}
                })
            }
        }
        if ( email === 'proveedor@correo.com' && proveedor === 'verificador' ) {
            req.email = {
                email,
                proveedor,
                tokenZoho: token,
                permiso: ''
            };
            next();
        } else {
            return res.status(401).json({
                message: 'V-JWT the token is not valid',
                data: {}
            })
        }
    } catch (errorTry) {
        res.status(500).json({
            message: `[J-WT] ${errorTry}`,
            data: []
        });
    }

};

module.exports = {
    fn_validateJWTProv,
    fn_generateJWT,
    fn_validateJWTProvO,
    fn_validateJWTProv1,
    fn_validateJWT
}