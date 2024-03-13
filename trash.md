


// jsonResult = await consumir_search.get(`${expedientes}/files`);
// let id_driver = ''
// jsonResult.data.data.map((data) => {
//     if (data.attributes.name === reqBody.id_cliente) {
//         id_driver = data.id
//     }
// });


// const imagenToBase64 = async(archivo) => {
//     return new Promise(resolve => {
//         if (archivo !== null || archivo !== '') {
//             if (archivo.type === 'image/jpeg' || archivo.type === 'image/jpg' || archivo.type === 'image/png' || archivo.type === 'application/pdf') {
//                 const leer = new FileReader();
//                 leer.readAsDataURL(archivo);
//                 leer.onload = () => resolve({
//                     bandera: true,
//                     base64: leer.result,
//                     name: archivo.name
//                 });
//             } else {
//                 resolve({
//                     bandera: false,
//                     base64: '',
//                     name: ''
//                 });
//             }
//         } else {
//             resolve({
//                 bandera: false,
//                 base64: '',
//                 name: ''
//             });
//         }
//     });
// };



// console.log(req.query);
// console.log(req.params);
// console.log(req.body);
// console.log(req.files);
// const uploadPath = path.join(__dirname, '../uploads/', req.files.file.name);
// req.files.file.mv(uploadPath);
// console.log(contect.id);
// console.log(contect.Email);
// console.log(contect.Acceso_App);
// console.log(contect.Calve_App);
// console.log(contect.id_cliente);

// fs.writeFileSync(uploadPath, image);
// console.log(jsonResult.headers['content-disposition'].split('.'));
// const uploadPath = path.join(__dirname, '../uploads/', 'image.txt');
// fs.appendFileSync(uploadPath, jsonResult.data);
// const img = await imagenToBase64(jsonResult.data);
// console.log(img);
// return res.send
// const image = Buffer.from(jsonResult.data);
// fs.writeFileSync(uploadPath, image);

// const uploadPath = path.join(__dirname, '../uploads/', 'image.png');
// const photoData = jsonResult.data;
// const photoBuffer = Buffer.from(photoData, 'base64');

// fs.writeFile(uploadPath, photoBuffer, 'binary', err => {
//     if (err) {
//         console.error('Error saving contact photo:', err);
//     } else {
//         console.log('Contact photo saved.');
//     }
// });