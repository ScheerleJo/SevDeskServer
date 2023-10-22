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
    alert('hi');
}


function setTableWidth(width) {
    // tableWidth = width; 
    let tableWidth = ['Spenden', 'Datum', 'Kundennummer', 'Vorname(n)', 'Nachname', 'Titel', 'Kategorie', 'Name2', 'Status', 'Währung', 'Summe'];
}

function setData(data) {
    // TableData = data;
    let data = {
        "objects": [
           
        ]
    };
    tableData = data.objects;
}
