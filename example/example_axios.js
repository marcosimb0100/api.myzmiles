const axios = require('axios');
let data = JSON.stringify({
    "Receiver": {
        "Name": "IO2-IN ORDER 2",
        "CfdiUse": "S01",
        "Rfc": "XEXX010101000",
        "FiscalRegime": "616",
        "TaxRegistrationNumber": "824712203",
        "TaxResidence": "USA",
        "TaxZipCode": "44100"
    },
    "CfdiType": "I",
    "NameId": "26",
    "Folio": "asda",
    "ExpeditionPlace": "44100",
    "PaymentForm": "01",
    "PaymentMethod": "PUE",
    "Exportation": "02",
    "Items": [{
        "IdentificationNumber": "CX-000988",
        "Quantity": "1",
        "ProductCode": "44121706",
        "UnitCode": "DPC",
        "Unit": "PIEZA",
        "TaxObject": "02",
        "Description": "Es un lapiz",
        "UnitPrice": "100",
        "Subtotal": "100.00",
        "Taxes": [{
            "Name": "IVA",
            "Rate": 0.16,
            "Total": 16,
            "Base": 100,
            "IsRetention": "false"
        }],
        "Total": 116
    }],
    "Complemento": {
        "ForeignTrade": {
            "Issuer": {
                "Address": {
                    "Street": "Cañada de Gomez",
                    "ExteriorNumber": "110",
                    "InteriorNumber": "A",
                    "Reference": "-",
                    "Municipality": "028",
                    "State": "SLP",
                    "Country": "MEX",
                    "ZipCode": "78216"
                }
            },
            "Receiver": {
                "Address": {
                    "Street": "Thompson Drive",
                    "ExteriorNumber": "3994",
                    "InteriorNumber": "A",
                    "Locality": "Oakland",
                    "Municipality": "028",
                    "State": "CA",
                    "Country": "USA",
                    "ZipCode": "94612"
                }
            },
            "Commodity": [{
                "SpecificDescriptions": [{
                    "Brand": "Volkswagen",
                    "Model": "Polo",
                    "SubModel": "GTI",
                    "SerialNumber": "4556789542156"
                }],
                "IdentificationNumber": "CX-000988",
                "TariffFraction": "9609100100",
                "CustomsQuantity": "1",
                "CustomsUnit": "06",
                "CustomsUnitValue": 10.6
            }],
            "OperationType": "2",
            "RequestCode": "A1",
            "OriginCertificate": "true",
            "Incoterm": "CFR",
            "Subdivision": 1,
            "ExchangeRateUSD": 17.8252,
            "TotalUSD": 12112.99,
            "OriginCertificateNumber": "30001000000400002434",
            "Observations": "sample string 8"
        }
    }
});

let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: 'https://apisandbox.facturama.mx/3/cfdis',
    headers: {
        'Authorization': 'Basic c29sb24wMjAwOndoeTAyMDBoaQ==',
        'Content-Type': 'application/json',
        'Cookie': '.ASPXAUTH=17A31FE78B3646A58C9891A941EF1A031BCC6BD4E45EED8748BEC8BB9CAB50BFA3388189CFD7975935A3BA36F1F164FB2B281DC2B0B166FC1C780C7F2BCAD82A6B6CFE443FE0DE8FFCC2674DC1E59B7E137BE105E7BFA690CF83527125C988C1'
    },
    data: data
};

axios.request(config)
    .then((response) => {
        console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
        console.log(error);
    });