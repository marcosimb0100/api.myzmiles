const { Router, request, response, json } = require('express');
const FormData = require('form-data');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { zoho_refresh_token_crm, zoho_refresh_token_wd } = require('../helpers/zoho-token');
const { fn_generateJWT, fn_validateJWTProv, fn_validateJWTProvO, fn_validateJWTProv1 } = require('../helpers/app-token');
const routerZoho = Router();
// const fileDownload = require('js-file-download');
const { v4: uuidv4 } = require('uuid');

const urls = [{
    name: 'crm_contact',
    url: 'https://www.zohoapis.com/crm/v2/Contacts/'
}, {
    name: 'crm_services',
    url: 'https://www.zohoapis.com/crm/v2/Medical_Services'
}, {
    name: 'dw_files',
    url: 'https://www.zohoapis.com/workdrive/api/v1/files/'
}, {
    name: 'crm_requests',
    url: 'https://www.zohoapis.com/crm/v2/Deals'
}, {
    name: 'crm_frequent_questions',
    url: 'https://www.zohoapis.com/crm/v2/Frequent_Questions'
}];

// const expedientes = 'bcnqa68f6b83f98cd46ab8e7f5d891d48748c';




const crm_contact_profile = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        const { success, token, message } = await zoho_refresh_token_crm();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_contact');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get(`search?email=${reqBody.email}`);

            if (jsonResult.status === 200) {

                const contect = jsonResult.data.data[0];

                if (contect.Acceso_App) {
                    return res.status(400).json({
                        message: 'zoho-you already have access',
                        data: {}
                    });
                }

                //contact data
                // ==============================================================================================================================================================================================
                const consumir_update = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
                jsonResultUp = await consumir_update.put(`${contect.id}`, {
                    "data": [{
                        "First_Name": reqBody.first_name,
                        "Last_Name": reqBody.last_name,
                        "Access_App": Boolean(reqBody.acceso_app),
                        "Password_App": reqBody.clave_app
                    }]
                });
                // console.log(jsonResultUp.data);
                // ==============================================================================================================================================================================================
                if (req.files !== null) {
                    var formData = new FormData();
                    formData.append("file", req.files.file.data, 'contact.png');
                    const consumir_photo = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}`, 'Content-Type': 'multipart/form-data' } });
                    jsonResultPhoto = await consumir_photo.post(`${contect.id}/photo?restrict_triggers=workflow`, formData);
                }
                // ==============================================================================================================================================================================================

                let zohoMessage = 'zoho-the upgrade was successful';

                return res.status(200).json({
                    message: zohoMessage,
                    data: {}
                });

            } else {

                return res.status(400).json({
                    message: 'zoho-query fail, the mail does not exist',
                    data: {}
                });

            }

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.put('/contacts/', crm_contact_profile);


const crm_contact_access = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        const { success, token, message } = await zoho_refresh_token_crm();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_contact');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get(`search?email=${reqBody.email}`);


            if (jsonResult.status === 204) {

                return res.status(400).json({
                    message: `zoho-the email does not exist in the database`,
                    data: {}
                });

            }


            const contact = jsonResult.data.data.find(e => e.Email === reqBody.email);

            if (!contact.Access_App) {

                return res.status(400).json({
                    message: 'zoho-you still do not have access',
                    data: {}
                });

            }

            if (contact.Password_App === undefined || contact.Password_App === null) {

                return res.status(400).json({
                    message: 'zoho-there is a problem with your password, please contact myzmiles',
                    data: {}
                });

            }

            if (contact.Email === reqBody.email && contact.Password_App === reqBody.calve_app) {

                let jwt = await fn_generateJWT(contact.id, contact.Email);

                return res.status(200).json({
                    message,
                    data: {
                        id: contact.id,
                        id_cliente: contact.Id_Contact,
                        email: contact.Email,
                        full_name: contact.Full_Name,
                        first_name: contact.First_Name,
                        last_name: contact.Last_Name,
                        jwt
                    }
                });

            } else {

                return res.status(400).json({
                    message: 'zoho-the data entered is incorrect',
                    data: {}
                });

            }

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.post('/contacts_access/', crm_contact_access);


const crm_contact_photo = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        const { success, token, message } = await zoho_refresh_token_crm();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_contact');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}`, 'responseType': 'arraybuffer' } });
            jsonResult = await consumir_search.get(`${reqBody.id}/photo`);


            return res.status(200).json({
                message: 'hola',
                data: jsonResult.data
            });

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/contacts_photo/', crm_contact_photo);


const crm_services = async(req = request, res = response) => {

    try {

        const reqBody = req.body;

        const { success, token, message } = await zoho_refresh_token_crm();
        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_services');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get();


            const crm_contact00 = urls.find(e => e.name === 'crm_requests');
            const consumir_search00 = axios.create({ baseURL: crm_contact00.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult00 = await consumir_search00.get();


            // jsonResult00.data.data.filter(e => e.Id_Contact === reqBody.id_cliente).map((data) => {

            //     // console.log(data);

            //     if (data.Tipo_Servicio.name === reqBody.tipo_servicio) {

            //         solicitudes = [...solicitudes, {
            //             id: data.id,
            //             fecha_entrega: data.Fecha_entrega,
            //             monto: data.Monto,
            //             tipo_servicio: reqBody.tipo_servicio,
            //             estatus: data.Estatus
            //         }];
            //     }

            // });


            let solicitudes = [];
            await jsonResult.data.data.map(async(e) => {

                let solicitudesTipo = [];
                jsonResult00.data.data.filter(e => e.Id_Contact === reqBody.id_cliente).map((data) => {

                    if (data.Interest.name === e.Name) {

                        solicitudesTipo = [...solicitudesTipo, {
                            id: data.id,
                            fecha_entrega: data.Closing_Date,
                            monto: data.Amount,
                            tipo_servicio: data.Interest.Name,
                            estatus: data.Status_Validation,
                            id_cliente: data.Id_Contact,
                            id_Servicio: data.Id_Interest,
                            drive_solicitud: data.Drive_Interest.split('/')[data.Drive_Interest.split('/').length - 1]

                        }];

                    }

                });

                solicitudes = [...solicitudes, {
                    Name: e.Name,
                    solicitudesTipo
                }];

            });

            return res.status(200).json({
                message,
                data: solicitudes
            });



        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.post('/services_medical/', crm_services);


const dw_files = async(req = request, res = response) => {

    try {

        const reqBody = req.params;
        const { success, token, message } = await zoho_refresh_token_wd();
        if (success) {

            const crm_contact = urls.find(e => e.name === 'dw_files');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get(`${expedientes}/files`);

            let id_driver = ''
            jsonResult.data.data.map((data) => {
                if (data.attributes.name === reqBody.id_cliente) {
                    id_driver = data.id
                }
            });


            jsonResultFiles = await consumir_search.get(`${id_driver}/files`);
            let filesDrivers = [];

            jsonResultFiles.data.data.map((data) => {

                if (data.attributes.type !== 'folder') {
                    filesDrivers = [...filesDrivers, {
                        id: data.id,
                        name: data.attributes.name,
                        type: data.attributes.type,
                        download_url: data.attributes.download_url
                    }];
                }
            });

            return res.status(200).json({
                message,
                data: filesDrivers
            });



        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/files/:id_cliente', dw_files);


const crm_requests = async(req = request, res = response) => {

    try {

        const reqBody = req.body;

        const { success, token, message } = await zoho_refresh_token_crm();
        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get();

            let solicitudes = [];

            jsonResult.data.data.filter(e => e.id_cliente === reqBody.id_cliente).map((data) => {

                if (data.Tipo_Servicio.name === reqBody.tipo_servicio) {

                    solicitudes = [...solicitudes, {
                        id: data.id,
                        fecha_entrega: data.Fecha_entrega,
                        monto: data.Monto,
                        tipo_servicio: reqBody.tipo_servicio,
                        estatus: data.Estatus
                    }];

                }

            });

            return res.status(200).json({
                message,
                data: solicitudes
            });

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/requests/', crm_requests);


const dw_drive = async(req = request, res = response) => {

    try {

        const reqBody = req.params;
        const { success, token, message } = await zoho_refresh_token_wd();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'dw_files');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResultFiles = await consumir_search.get(`${reqBody.drive_solicitud}/files`);

            let filesDrivers = [];

            jsonResultFiles.data.data.map((data) => {

                if (data.attributes.type !== 'folder') {
                    filesDrivers = [...filesDrivers, {
                        id: data.id,
                        name: data.attributes.name,
                        type: data.attributes.type,
                        download_url: data.attributes.download_url
                    }];
                }

            });

            return res.status(200).json({
                message,
                data: filesDrivers
            });



        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/drive/:drive_solicitud', dw_drive);


const dw_token = async(req = request, res = response) => {

    try {

        const { success, token, message } = await zoho_refresh_token_wd();
        if (success) {

            return res.status(200).json({
                message,
                data: {
                    token
                }
            });



        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/dw_token/', dw_token);


const crm_frequent_questions = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        const { success, token, message } = await zoho_refresh_token_crm();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_frequent_questions');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult01 = await consumir_search.get();
            // console.log(crm_contact.url, token);
            // jsonResult = await consumir_search.get(`search?email=${reqBody.email}`);

            let QuestionsArray = [];
            if (jsonResult01.status === 200) {

                await Promise.all(await jsonResult01.data.data.map(async(row) => {

                    jsonResult02 = await consumir_search.get(`/${row.id}`);
                    let AnswersArray = [];
                    jsonResult02.data.data.map(async(data) => {

                        await Promise.all(data.Answers.map((d) => {
                            AnswersArray = [...AnswersArray, {
                                id: d.id,
                                Answer: d.Answer
                            }];
                        }));

                    })

                    QuestionsArray = [...QuestionsArray, {

                        id: row.id,
                        NameQuestion: row.Name,
                        Answers: AnswersArray
                    }];




                }));

                return res.status(200).json({
                    message,
                    data: QuestionsArray
                });

            } else {

                return res.status(400).json({
                    message: 'zoho-query fail',
                    data: {}
                });

            }

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/frequent_questions/', crm_frequent_questions);


// =================================================================================================================================================================
// =================================================================================================================================================================
// =================================================================================================================================================================
// =================================================================================================================================================================
// =================================================================================================================================================================
//PROVEEDOR VERIRICADOR
// =================================================================================================================================================================
// =================================================================================================================================================================























const approved_supplier = async (req = request, res = response) => {

    try {

        const { id, supplier_files } = req.body;
        // const reqBody = req.body;
        const { success, token, message } = await zoho_refresh_token_crm();
        if (success) {
            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_update = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_update.put(`/${id}`, {
                    "data": [{
                        // "Status_Validation": reqBody.Status_Validation,
                        "Supplier_Files": supplier_files
                        // "Lower_aligners": reqBody.Lower_aligners,
                        // "Number_aligners": reqBody.Number_aligners,
                        // "Reason_Decline": reqBody.Reason_Decline
                    }]
                });
            if (jsonResult.status === 200) {

                return res.status(200).json({
                    message,
                    data: jsonResult.data.data
                });
            } else {

                return res.status(400).json({
                    message: 'zoho-query fail',
                    data: {}
                });
            }
        } else {

            return res.status(400).json({
                message,
                data: {}
            });
        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.post('/approved_supplier', [fn_validateJWTProvO], approved_supplier);




// =================================================================================================================================================================
// =================================================================================================================================================================
// =================================================================================================================================================================
// =================================================================================================================================================================
// =================================================================================================================================================================
//PROVEEDOR FABRICANTE
// =================================================================================================================================================================
// =================================================================================================================================================================

const crm_deals_fab = async(req = request, res = response) => {

    try {

        const { success, token, message } = await zoho_refresh_token_crm();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get();


            if (jsonResult.status === 200) {

                return res.status(200).json({
                    message,
                    data: jsonResult.data.data
                });

            } else {

                return res.status(400).json({
                    message: 'zoho-query fail',
                    data: {}
                });

            }

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/deals_fab/', [fn_validateJWTProv1], crm_deals_fab);


const crm_deals_update_fab = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        
        const { success, token, message } = await zoho_refresh_token_crm();

        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_update = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_update.put(`/${reqBody.id}`, {
                    "data": [{
                        "Stage_Replica": reqBody.Stage_Replica
                    }]
                });

            if (jsonResult.status === 200) {

                return res.status(200).json({
                    message,
                    data: jsonResult.data.data
                });

            } else {

                return res.status(400).json({
                    message: 'zoho-query fail',
                    data: {}
                });

            }

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.put('/deals_update_fab/', [fn_validateJWTProv1], crm_deals_update_fab);


const crm_requests_notes_fab = async(req = request, res = response) => {

    try {

        const reqBody = req.params;

        const { success, token, message } = await zoho_refresh_token_crm();
        if (success) {

            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get(`/${reqBody.id}/Notes`);



            let notes = [];

            if (jsonResult.data !== '') {

                jsonResult.data.data.map((data) => {
                    notes = [...notes, {
                        note_title: data.Note_Title,
                        note_content: data.Note_Content,
                        note_created_time: data.Created_Time
                    }];

                });

            }

            return res.status(200).json({
                message,
                data: notes
            });

        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/requests_notes_fab/:id', [fn_validateJWTProv1], crm_requests_notes_fab);


const dw_files_fab = async(req = request, res = response) => {

    try {

        const reqBody = req.params;
       
        const { success, token, message } = await zoho_refresh_token_wd();
        if (success) {

            const crm_contact = urls.find(e => e.name === 'dw_files');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            jsonResult = await consumir_search.get(`bcnqa68f6b83f98cd46ab8e7f5d891d48748c/files`);

            //================================Contact
            let id_driver_contact = ''
            jsonResult.data.data.map((data) => {
                if (data.attributes.name === reqBody.id_contact) {
                    id_driver_contact = data.id
                }
            });
            //================================
            

            //================================interest
            jsonResultFilesInterest = await consumir_search.get(`${id_driver_contact}/files`);

            let id_interest = ''
            jsonResultFilesInterest.data.data.map((data) => {
                if (data.attributes.name === reqBody.id_interest) {
                    id_interest = data.id
                }
            });
            //================================
            

            let filesDrivers = [];
            let parent_id = '';
            jsonResultFiles = await consumir_search.get(`${id_interest}/files`);

            jsonResultFiles.data.data.map((data) => {

                if (data.attributes.type !== 'folder') {
                    filesDrivers = [...filesDrivers, {
                        id: data.id,
                        name: data.attributes.name,
                        type: data.attributes.type,
                        download_url: data.attributes.download_url,
                        parent_id: data.attributes.parent_id
                    }];
                    parent_id = data.attributes.parent_id
                }
            });

            console.log(parent_id);

            return res.status(200).json({
                message,
                data: {
                    filesDrivers,
                    token,
                    parent_id
                }
            });



        } else {

            return res.status(400).json({
                message,
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/files_fab/:id_contact/:id_interest', [fn_validateJWTProv1], dw_files_fab);


const dw_files_download_fab = async(req = request, res = response) => {

    try {

        const { token, file, name } = req.body;

        const consumir_search = axios.create({ baseURL: `https://download.zoho.com/v1/workdrive/download/`, responseType: 'stream', headers: { 'responseType': 'blob', 'Authorization': `Zoho-oauthtoken ${token}` } });
        jsonResult = await consumir_search.get(`${file}`);
        
        if( jsonResult.status === 200 ){
            
            const doc = path.join(__dirname, `../drive/${name}`);
            if (fs.existsSync(doc)) {
                fs.unlinkSync(doc);
              }

            await new Promise(async (resolve, reject) => {

                await jsonResult.data.pipe(fs.createWriteStream(`./drive/${name}`))
                    .on('error', reject )
                    .once('close', () => resolve(`./drive/${name}`)); 

            });

            return res.sendFile( doc );

        }else{

            return res.status(400).json({
                message: 'Error de carga',
                data: {}
            });

        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.post('/files_download_fab/', [fn_validateJWTProv1], dw_files_download_fab);





















const crm_login_prov01 = async(req = request, res = response) => {

    try{

        const { email, password } = req.body;
        if( (email === 'proveedor@correo.com' && password === 'proveedor') || (email === 'proveedorfinal@correo.com' && password === 'proveedorfinal') ){
            const permiso = await fn_generateJWT(email);
            if(email === 'proveedor@correo.com'){
                return res.status(200).json({
                    message: ``,
                    permiso,
                    email,
                    proveedor: 'verificador',
                    data: {}
                });
            }else if(email === 'proveedorfinal@correo.com'){
                return res.status(200).json({
                    message: ``,
                    permiso,
                    email,
                    proveedor: 'fabricante',
                    data: {}
                });
            }
        }else{
            return res.status(400).json({
                message: `the data is incorrect.`,
                data: {}
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });
    }

};
routerZoho.post('/login01/', crm_login_prov01);


const crm_deals = async(req = request, res = response) => {

    try {
            const { email, tokenZoho, permiso } = req.email;
            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
            jsonResult = await consumir_search.get();
            if (jsonResult.status === 200) {
                return res.status(200).json({
                    message: 'Consulta exitosa.',
                    permiso,
                    email,
                    data: jsonResult.data.data
                });
            } else {
                return res.status(400).json({
                    message: 'zoho-query fail',
                    data: {}
                });
            }
    } catch (e) {
        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });
    }

};
routerZoho.get('/deals/', [fn_validateJWTProv], crm_deals);


const crm_requests_notes = async(req = request, res = response) => {

    try {

            const reqBody = req.params;
            const { email, tokenZoho, permiso } = req.email;
            const crm_contact = urls.find(e => e.name === 'crm_requests');
            const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
            jsonResult = await consumir_search.get(`/${reqBody.id}/Notes`);
            let notes = [];
            if (jsonResult.data !== '') {
                jsonResult.data.data.map((data) => {
                    notes = [...notes, {
                        note_title: data.Note_Title,
                        note_content: data.Note_Content,
                        note_created_time: data.Created_Time
                    }];
                });
            }
            return res.status(200).json({
                message: 'Consulta exitosa.',
                permiso,
                email,
                data: notes
            });

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/requests_notes/:id', [fn_validateJWTProv], crm_requests_notes);


const dw_files_prov = async(req = request, res = response) => {

    try {

        const reqBody = req.params;
        const { email, tokenZoho, permiso } = req.email;
        const crm_contact = urls.find(e => e.name === 'dw_files');
        const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
        jsonResult = await consumir_search.get(`bcnqa68f6b83f98cd46ab8e7f5d891d48748c/files`);
        //================================Contact
        let id_driver_contact = ''
        jsonResult.data.data.map((data) => {
            if (data.attributes.name === reqBody.id_contact) {
                id_driver_contact = data.id
            }
        });
        //================================interest
        jsonResultFilesInterest = await consumir_search.get(`${id_driver_contact}/files`);
        let id_interest = ''
        jsonResultFilesInterest.data.data.map((data) => {
            if (data.attributes.name === reqBody.id_interest) {
                id_interest = data.id
            }
        });
        //================================
        let filesDrivers = [];
        let parent_id = '';
        jsonResultFiles = await consumir_search.get(`${id_interest}/files`);
        jsonResultFiles.data.data.map((data) => {
            if (data.attributes.type !== 'folder') {
                filesDrivers = [...filesDrivers, {
                    id: data.id,
                    name: data.attributes.name,
                    type: data.attributes.type,
                    download_url: data.attributes.download_url,
                    parent_id: data.attributes.parent_id
                }];
                parent_id = data.attributes.parent_id
            }
        });
        console.log(parent_id);
        //================================
        return res.status(200).json({
            message: 'Consulta exitosa.',
            permiso,
            email,
            data: {
                filesDrivers,
                token: tokenZoho,
                parent_id
            }
        });
    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.get('/files_prov/:id_contact/:id_interest', [fn_validateJWTProv], dw_files_prov);


const dw_files_download = async(req = request, res = response) => {

    try {

        const { file, name } = req.body;
        const { email, tokenZoho, permiso } = req.email;
        const consumir_search = axios.create({ baseURL: `https://download.zoho.com/v1/workdrive/download/`, responseType: 'stream', headers: { 'responseType': 'blob', 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
        jsonResult = await consumir_search.get(`${file}`);
        if( jsonResult.status === 200 ){
            const doc = path.join(__dirname, `../drive/${name}`);
            if (fs.existsSync(doc)) {
                fs.unlinkSync(doc);
              }
            await new Promise(async (resolve, reject) => {
                await jsonResult.data.pipe(fs.createWriteStream(`./drive/${name}`))
                    .on('error', reject )
                    .once('close', () => resolve(`./drive/${name}`)); 
            });
            return res.sendFile( doc );
        }else{
            return res.status(400).json({
                message: 'Error de carga',
                permiso,
                email,
                data: {}
            });
        }

    } catch (e) {

        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.post('/files_download/', [fn_validateJWTProv], dw_files_download);


const crm_deals_update = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        const { email, tokenZoho, permiso } = req.email;
        const crm_contact = urls.find(e => e.name === 'crm_requests');
        const consumir_update = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
        jsonResult = await consumir_update.put(`/${reqBody.id}`, {
                "data": [{
                    "Status_Validation": reqBody.Status_Validation
                }]
            });

        if (jsonResult.status === 200) {
            return res.status(200).json({
                message: 'Consulta exitosa.',
                permiso,
                email,
                data: jsonResult.data.data
            });
        } else {
            return res.status(400).json({
                message: 'zoho-query fail',
                permiso: '',
                email: '',
                data: {}
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });
    }

};
routerZoho.put('/deals_update/', [fn_validateJWTProv], crm_deals_update);


const crm_deals_update_declined = async(req = request, res = response) => {

    try {

        const reqBody = req.body;
        const { email, tokenZoho, permiso } = req.email;
        const crm_contact = urls.find(e => e.name === 'crm_requests');
        const consumir_update = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
        jsonResult = await consumir_update.put(`/${reqBody.id}`, {
                "data": [{
                    "Status_Validation": reqBody.Status_Validation,
                    "Reason_Decline": reqBody.Reason_Decline
                }]
            });

        if (jsonResult.status === 200) {
            return res.status(200).json({
                message: 'Consulta exitosa.',
                permiso,
                email,
                data: jsonResult.data.data
            });
        } else {
            return res.status(400).json({
                message: 'zoho-query fail',
                data: {}
            });
        }
    } catch (e) {
        return res.status(500).json({
            message: `Api ${e}`,
            data: {}
        });
    }

};
routerZoho.put('/deals_update_declined/', [fn_validateJWTProv], crm_deals_update_declined);


const produce_ok = async (req = request, res = response) => {

    try {
        const nombreTemp = uuidv4();
        const reqBody = req.body;
        const { email, tokenZoho, permiso } = req.email;

        const crm_contact = urls.find(e => e.name === 'dw_files');
        const consumir_search = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
        jsonResult = await consumir_search.get(`bcnqa68f6b83f98cd46ab8e7f5d891d48748c/files`);

        let id_driver_contact = ''
        jsonResult.data.data.map((data) => {
            if (data.attributes.name === reqBody.id_contact) {
                id_driver_contact = data.id
            }
        });

        jsonResultFilesInterest = await consumir_search.get(`${id_driver_contact}/files`);
        let id_interest = ''
        jsonResultFilesInterest.data.data.map((data) => {
            if (data.attributes.name === reqBody.id_interest) {
                id_interest = data.id
            }
        });

        if( req.files !== null ){
            if( Array.isArray( req.files.files )){
                console.log( 'Lista' );
            }else{
                const doc = path.join(__dirname, `../uploads/${nombreTemp}`);
                if (!fs.existsSync(doc)) {
                    fs.mkdirSync(doc);
                }
                const uploadPath = path.join( __dirname, '../uploads/', nombreTemp, '/', req.files.files.name );
                await new Promise( (resolve, reject) => {
                    req.files.files.mv(uploadPath, (err) => {
                        if (err) {
                            reject(err);
                        }
                        resolve( 'ok' );
                    });
                });
                let data = new FormData();
                data.append('parent_id', id_interest);
                data.append('content', fs.createReadStream(uploadPath));
                data.append('override-name-exist', 'false');
                let config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: 'https://www.zohoapis.com/workdrive/api/v1/upload',
                headers: { 
                    'Authorization': `Zoho-oauthtoken ${tokenZoho}`
                },
                data : data
                };
                await axios.request(config);
                fs.rmSync(path.join( __dirname, '../uploads/', nombreTemp ), { recursive: true, force: true });
            }

        }


        const crm_contact00 = urls.find(e => e.name === 'crm_requests');
        const consumir_update00 = axios.create({ baseURL: crm_contact00.url, headers: { 'Authorization': `Zoho-oauthtoken ${tokenZoho}` } });
        jsonResult00 = await consumir_update00.put(`/${reqBody.id}`, {
            "data": [{
                "Supplier_Files": reqBody.stringFilesUpload,
                "Upper_aligners": reqBody.upperAlignersInput,
                "Lower_aligners": reqBody.lowerAlignersInput,
                "Number_aligners": reqBody.numberAlignersInput,
                "Status_Validation": reqBody.status
            }]
        });

        if (jsonResult00.status === 200) {

            return res.status(200).json({
                message: 'Consulta exitosa.',
                permiso,
                email,
                data: {}
            });

        } else {

            return res.status(400).json({
                message: 'zoho-query fail',
                permiso: '',
                email: '',
                data: {}
            });

        }

    } catch (e) {

        // console.log( 'error' )
        // console.log( e )

        return res.status(400).json({
            message: `Api ${e}`,
            data: {}
        });

    }

};
routerZoho.post('/produce_ok', [fn_validateJWTProv], produce_ok);

module.exports = routerZoho;


// const { success, token, message } = await zoho_refresh_token_crm();

        // if (success) {

            // const crm_contact = urls.find(e => e.name === 'crm_requests');
            // const consumir_update = axios.create({ baseURL: crm_contact.url, headers: { 'Authorization': `Zoho-oauthtoken ${token}` } });
            // jsonResult = await consumir_update.put(`/${reqBody.id}`, {
            //         "data": [{
            //             "Supplier_Files": reqBody.stringFilesUpload,
            //             "Upper_aligners": reqBody.upperAlignersInput,
            //             "Lower_aligners": reqBody.lowerAlignersInput,
            //             "Number_aligners": reqBody.numberAlignersInput,
            //             "Status_Validation": reqBody.status
            //         }]
            //     });

            // if (200 === 200) {

            //     return res.status(200).json({
            //         message,
            //         data: jsonResult.data.data
            //     });
            // } else {

            //     return res.status(400).json({
            //         message: 'zoho-query fail',
            //         data: {}
            //     });
            // }
        // } else {

        //     return res.status(400).json({
        //         message,
        //         data: {}
        //     });
        // }
