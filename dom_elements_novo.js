import { draw_infostructure_lines } from "./draw.js"  
import { API_HOST } from "./host_envs.js";  

// FILE FOR OPERATIONS REGARDING DOM ELEMENTS  

function read_files(limiter, olt, map) {  
    document.getElementById("file_container").style.display = "none"  
    let data = new FormData();  
    const input = document.getElementById("file_entry");  
    data.append("rede", input.files[0]);  
    data.append("limiter", JSON.stringify(limiter))  
    data.append("OLT", JSON.stringify(olt))  

    let map_div = document.getElementById("map")  
    let map_container = document.getElementById("map-container")  

    var loading = document.createElement('div')  
    loading.className = 'loading-animation'  

    map_container.removeChild(map_div)  
    map_container.appendChild(loading)  

    fetch(API_HOST + "/upload_csv/", {  
        method: "POST",  
        credentials: "include",  
        body: data,  
        header: {  
            'Accept': 'application/json',  
            'Content-Type': 'multipart/form-data',  
        },  
    })  
    .then(response => {  
        map_container.removeChild(loading)  
        map_container.appendChild(map_div)  
        response.json().then(response_data => {  
            const paths = response_data.drawablePaths  
            draw_infostructure_lines(paths, map)  
        })  
    })  
}  

function handle_limit_click() {  
    let new_limit = prompt("new limit")  
    if (new_limit === null || new_limit === "") {  
        return  
    }  
    document.getElementById("limit").innerText = new_limit  
}  

function get_limit() {  
    const limit_obj = document.getElementById("limit")  
    return parseFloat(limit_obj.innerText)  
}  

let mode = "CUT"  
function get_mode() {  
    return mode  
}  

function set_mode(new_mode) {  
    mode = new_mode.toUpperCase()  
    if (!["BRANCH", "CUT"].includes(mode)) {  
        mode = "BRANCH"  
    }  
}  

function show_download_button() {  
    const download_button = document.getElementById("download");  
    download_button.style.display = "flex"  
}  

function hide_download_button() {  
    const download_button = document.getElementById("download");  
    download_button.style.display = "none"  // Corrigido para esconder o botão corretamente  
}  

async function fill_selects() {  

    function pretify_json(obj) {  
        let r_str = "";  
        for (const prop in obj) {  
            r_str = r_str.concat(prop.concat(": ".concat(obj[prop] + " | ")));  
        }  
        r_str = r_str.slice(0, -3);  
        return r_str;  
    }  

    async function fetchAndPopulate(selectId, apiUrl) {  
        let select = document.getElementById(selectId);  
        const response = await fetch(apiUrl);  
        const json = await response.json();  
        const items = json[selectId]; // Ex: json[cables], json[boxes], etc.  

        select.innerHTML = ''; // Limpar as opções existentes  
        items.forEach(item => {  
            let opt = document.createElement('option');  
            opt.value = item.id;  
            opt.innerHTML = pretify_json(item);  
            select.appendChild(opt);  
        });  

        // Armazenar no localStorage  
        localStorage.setItem(selectId, JSON.stringify(items));  
    }  

    await fetchAndPopulate("cables", API_HOST + "/get-all-cables/");  
    await fetchAndPopulate("spliceboxes", API_HOST + "/get-all-spliceboxes/");  
    await fetchAndPopulate("uspliters", API_HOST + "/get-all-uspliters/");  
    await fetchAndPopulate("bspliters", API_HOST + "/get-all-bspliters/");  
}  

function loadFromLocalStorage() {  
    const selects = ['cables', 'spliceboxes', 'uspliters', 'bspliters'];  
    
    selects.forEach(selectId => {  
        const storedItems = JSON.parse(localStorage.getItem(selectId));  
        if (storedItems) {
            const select = document.getElementById(selectId);  
            select.innerHTML = ''; // Limpar as opções existentes  
            storedItems.forEach(item => {  
                let opt = document.createElement('option');  
                opt.value = item.id;  
                opt.innerHTML = pretify_json(item);  
                select.appendChild(opt);  
            });  
        }  
    });  
}  

async function delete_bspliter() {  
    const selectElement = document.getElementById('bspliters');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  
    selectedOptions.forEach(option => {  
        option.remove();  
    });  
    updateLocalStorage('bspliters');  
}  

async function delete_splicebox() {  
    const selectElement = document.getElementById('spliceboxes');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  
    selectedOptions.forEach(option => {  
        option.remove();  
    });  
    updateLocalStorage('spliceboxes');  
}  

async function delete_cable() {  
    const selectElement = document.getElementById('cables');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  
    selectedOptions.forEach(option => {  
        option.remove();  
    });  
    updateLocalStorage('cables');  
}  

async function delete_uspliter() {  
    const selectElement = document.getElementById('uspliters');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  
    selectedOptions.forEach(option => {  
        option.remove();  
    });  
    updateLocalStorage('uspliters');  
}  

function updateLocalStorage(selectId) {  
    const select = document.getElementById(selectId);  
    const options = Array.from(select.options).map(option => ({  
        id: option.value,  
        text: option.innerHTML  
    }));  
    localStorage.setItem(selectId, JSON.stringify(options));  
}  

// Chamar a função para carregar os dados do localStorage ao iniciar  
window.onload = function() {  
    loadFromLocalStorage();  
    fill_selects(); // Preencher selects com dados do servidor  
};  

// Expor funções para o escopo global  
window.delete_bspliter = delete_bspliter;  
window.delete_splicebox = delete_splicebox;  
window.delete_cable = delete_cable;  
window.delete_uspliter = delete_uspliter;  
window.new_splicebox = new_splicebox;  
window.new_cable = new_cable;  
window.new_uspliter = new_uspliter;  
window.new_bspliter = new_bspliter;  
window.read_files = read_files;  
window.handle_limit_click = handle_limit_click;  
window.new_session = handle_new_session_click;  

export { get_limit, get_mode, set_mode, show_download_button, hide_download_button, get_selected, read_files, fill_selects };  
