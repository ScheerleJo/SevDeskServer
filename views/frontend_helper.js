let tableWidth = {};
let tableData = {};

function showTable(status) {
    /*
    switch (status){
        case 'open-jobs': 
            alert('here are all open to be done Jobs');
            break;
        case 'check-jobs':
            alert('please check the here listed jobs');
            break;
        case 'successful-jobs':
            alert('here are the successfully closed jobs');
            break;
    }
    */

    const container = document.getElementsById('autocreate');
    let table = document.createElement('table');
    table.setAttribute('id', 'autocreate-table');

    let thead = document.createElement('thead');
    let trhead = document.createElement('tr')
    for (let i = 0; i < tableWidth.length; i++) {
        let th = document.createElement('th');
        th.appendChild(document.createTextNode(tableWidth[i]));
        trhead.appendChild(th);
    }
    thead.appendChild(trhead);
    
    table.appendChild(thead);


    let tbody = document.createElement('tbody');

    for (const key in tableData) {
        if (Object.hasOwnProperty.call(TableData, key)) {
            const element = tableData[key];
            let tr = document.createElement('tr');
            for (let j = 0; j < element.length; j++) {
                const cellElement = element[j];
                let td = document.createElement('td');
                td.appendChild(document.createTextNode(cellElement));
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }
    }
    table.appendChild(tbody);
    container.appendChild(table);
}


function setTableWidth(width) {
    // tableWidth = width; 
    let tableWidth = ['Spenden', 'Datum', 'Kundennummer', 'Vorname(n)', 'Nachname', 'Titel', 'Kategorie', 'Name2', 'Status', 'Währung', 'Summe'];
}

function setData(data) {
    // TableData = data;
    let data = {
        "objects": [
            {
                "id": "70322217",
                "voucherDate": "2023-09-19T00:00:00+02:00",
                "customerNumber": "2951",
                "surename": "Jürgen",
                "familyname": "Stamm",
                "titel": null,
                "category": {
                    "id": "4",
                    "create": "2012-01-04T19:40:32+01:00",
                    "name": "Partner",
                    "code": "P",
                    "type": "C",
                    "translationCode": "CATEGORY_PARTNER"
                },
                "name2": null,
                "status": "1000",
                "currency": "EUR",
                "sumNet": "25"
            },
            {
                "id": "70322140",
                "voucherDate": "2023-09-19T00:00:00+02:00",
                "customerNumber": "2950",
                "surename": "Anton",
                "familyname": "Mohler",
                "titel": null,
                "category": {
                    "id": "4",
                    "objectName": "Category",
                    "create": "2012-01-04T19:40:32+01:00",
                    "name": "Partner",
                    "code": "P",
                    "type": "C",
                    "translationCode": "CATEGORY_PARTNER"
                },
                "name2": null,
                "status": "1000",
                "currency": "EUR",
                "sumNet": "250"
            },
            {
                "id": "70125168",
                "voucherDate": "2023-09-18T00:00:00+02:00",
                "customerNumber": "2706",
                "surename": "Ingrid & Arno",
                "familyname": "Zeitler",
                "titel": null,
                "category": {
                    "id": "3",
                    "objectName": "Category",
                    "create": "2012-01-04T19:40:28+01:00",
                    "name": "Kunde",
                    "code": "K",
                    "type": "C",
                    "translationCode": "CATEGORY_CUSTOMER"
                },
                "name2": null,
                "status": "1000",
                "currency": "EUR",
                "sumNet": "100"
            }
        ]
    };
    tableData = data.objects;
}

setData();
setTableWidth();