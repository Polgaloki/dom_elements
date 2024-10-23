import { draw_infostructure_lines } from "./draw.js"
import { API_HOST } from "./host_envs.js";

// FILE FOR OPERATIONS REGARDING DOM ELEMENTS

function read_files(limiter, olt, map){
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

    fetch(API_HOST + "/upload_csv/", {method: "POST", credentials: "include", body: data, header: {
            'Accept': 'application/json',
            'Content-Type': 'multipart/form-data',},
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


function handle_limit_click(){
    let new_limit = prompt("new limit")
    if (new_limit === null || new_limit === ""){
        return
    }
    document.getElementById("limit").innerText = new_limit
}


function get_limit(){
    const limit_obj = document.getElementById("limit")
    return parseFloat(limit_obj.innerText)
}

let mode = "CUT"
function get_mode(){
    return mode
}


function set_mode(new_mode){
    mode = new_mode.toUpperCase()
    if (!["BRANCH", "CUT"].includes(mode)){
        mode = "BRANCH"
    }
}

function show_download_button(){
    const dowload_button = document.getElementById("download");
    dowload_button.style.display = "flex"
}


function hide_download_button(){
    const dowload_button = document.getElementById("download");
    dowload_button.style.display = "flex"
}


async function fill_selects(){

    function pretify_json(obj) {
        let r_str = "";
        for (const prop in obj) {
            r_str = r_str.concat(prop.concat(": ".concat(obj[prop] + " | ")));
        }
        r_str = r_str.slice(0, -3);
        return r_str;
    }

    let select = document.getElementById("cables")
    const cables_response = await fetch(API_HOST + "/get-all-cables/")
    const json_cables = await cables_response.json()
    const cables = json_cables.cables
    
    for(let i = 0; i<cables.length; i++){
        let opt = document.createElement('option');
        opt.value = cables[i].id;
        opt.innerHTML = pretify_json(cables[i]);
        select.appendChild(opt);
    }


    select = document.getElementById("spliceboxes")
    const boxes_response = await fetch(API_HOST + "/get-all-spliceboxes/")
    const json_boxes = await boxes_response.json()
    const boxes = json_boxes.boxes
    
    for(let i = 0; i<boxes.length; i++){
        let opt = document.createElement('option');
        opt.value = boxes[i].id;
        opt.innerHTML = pretify_json(boxes[i]);
        select.appendChild(opt);
    }

    select = document.getElementById("uspliters")
    const uspliters_response = await fetch(API_HOST + "/get-all-uspliters/")
    const json_uspliters = await uspliters_response.json()
    const uspliters = json_uspliters.uspliters
    
    for(let i = 0; i<uspliters.length; i++){
        let opt = document.createElement('option');
        opt.value = uspliters[i].id;
        opt.innerHTML = pretify_json(uspliters[i]);
        select.appendChild(opt);
    }

    select = document.getElementById("bspliters")
    const bspliters_response = await fetch(API_HOST + "/get-all-bspliters/")
    const json_bspliters = await bspliters_response.json()
    const bspliters = json_bspliters.bspliters
    
    for(let i = 0; i<bspliters.length; i++){
        let opt = document.createElement('option');
        opt.value = bspliters[i].id;
        opt.innerHTML = pretify_json(bspliters[i]);
        select.appendChild(opt);
    }
}


function get_selected(){
    const selectCable = document.getElementById('cables');
    const selectedCables = Array.from(selectCable.selectedOptions).map(option => parseInt(option.value));

    const selectBox = document.getElementById('spliceboxes');
    const selectedBoxes = Array.from(selectBox.selectedOptions).map(option => parseInt(option.value));

    const selectUspliter = document.getElementById('uspliters');
    const selectedUspliters = Array.from(selectUspliter.selectedOptions).map(option => parseInt(option.value));

    const selectBspliter = document.getElementById('bspliters');
    const selectedBspliters = Array.from(selectBspliter.selectedOptions).map(option => parseInt(option.value));

    return {cable:selectedCables[0], box: selectedBoxes[0], uspliters: selectedUspliters, bspliters: selectedBspliters}
}


async function handle_new_session_click(){
    await fetch(API_HOST + "/delete-session/", {credentials: "include"})
    window.location.reload()
}

function parseFields(inputString) {
  const keyValuePairs = inputString.split(' ');

  const obj = {};
  keyValuePairs.forEach(pair => {
    const [key, value] = pair.split('=');
    obj[key.trim()] = isNaN(value) ? value.trim() : parseFloat(value);
  });

  return obj;
}



async function new_splicebox(){
    const obj = {
        id: parseInt(document.getElementById('splicebox-id').value), 
        cost: parseFloat(document.getElementById('splicebox-cost').value), 
        attenuation: parseFloat(document.getElementById('splicebox-attenuation').value) 
    };
    const response = await fetch(API_HOST + "/add-splicebox/", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.status != 200){
        const errorData = await response.json();
        alert("Error while adding: " + JSON.stringify(errorData));
    } else {
        window.location.reload();
    }
}

async function new_cable(){
    const obj = {
        id: parseInt(document.getElementById('cable-id').value), 
        cost: parseFloat(document.getElementById('cable-cost').value), 
        attenuation: parseFloat(document.getElementById('cable-attenuation').value) 
    };
    const response = await fetch(API_HOST + "/add-cable/", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.status != 200){
        const errorData = await response.json();
        alert("Error while adding: " + JSON.stringify(errorData));
    } else {
        window.location.reload();
    }
}

async function new_uspliter(){
    const obj = {
        id: parseInt(document.getElementById('usplitter-id').value), 
        loss1: parseFloat(document.getElementById('usplitter-loss1').value), 
        loss2: parseFloat(document.getElementById('usplitter-loss2').value), 
        cost: parseFloat(document.getElementById('usplitter-cost').value) 
    };
    const response = await fetch(API_HOST + "/add-uspliter/", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.status != 200){
        const errorData = await response.json();
        alert("Error while adding: " + JSON.stringify(errorData));
    } else {
        window.location.reload();
    }
}

async function new_bspliter(){
    const obj = {
        id: parseInt(document.getElementById('bsplitter-id').value), 
        loss: parseFloat(document.getElementById('bsplitter-loss').value), 
        split: parseFloat(document.getElementById('bsplitter-split').value), 
        cost: parseFloat(document.getElementById('bsplitter-cost').value) 
    };
    const response = await fetch(API_HOST + "/add-bspliter/", {
        method: "POST",
        body: JSON.stringify(obj),
        headers: { 'Content-Type': 'application/json' }
    });
    if (response.status != 200){
        const errorData = await response.json();
        alert("Error while adding: " + JSON.stringify(errorData));
    } else {
        window.location.reload();
    }
}

async function delete_bspliter() {  
    const selectElement = document.getElementById('bspliters');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  

    // Remover opções com base na seleção  
    selectedOptions.forEach(option => {  
        selectElement.remove(option.index);  
    });  

    // Salvar as opções restantes no localStorage  
    saveSelectOptions('bspliters', selectElement);  
}  

async function delete_splicebox() {  
    const selectElement = document.getElementById('spliceboxes');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  

    selectedOptions.forEach(option => {  
        selectElement.remove(option.index);  
    });  

    saveSelectOptions('spliceboxes', selectElement);  
}  

async function delete_cable() {  
    const selectElement = document.getElementById('cables');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  

    selectedOptions.forEach(option => {  
        selectElement.remove(option.index);  
    });  

    saveSelectOptions('cables', selectElement);  
}  

async function delete_uspliter() {  
    const selectElement = document.getElementById('uspliters');  
    const selectedOptions = Array.from(selectElement.selectedOptions);  

    selectedOptions.forEach(option => {  
        selectElement.remove(option.index);  
    });  

    saveSelectOptions('uspliters', selectElement);  
}  

const loadedIds = ['bspliters', 'spliceboxes', 'cables', 'uspliters'];

function loadSelectOptions(selectId, selectElement) {
    const options = JSON.parse(localStorage.getItem(selectId));
    console.log(`Loading ${selectId}:`, options);
    
    // Verificar se as opções já foram carregadas manualmente
    if (!loadedIds.includes(selectId)) {
        selectElement.innerHTML = ''; // Limpar as opções existentes
        options.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.text = value;
            selectElement.add(option);
        });
        
        // Marcar como carregado após inserir as opções
        loadedIds.push(selectId);
    }
}

// Carregar opções ao iniciar a página
window.onload = () => {
    loadedIds.forEach(id => {
        loadSelectOptions(id, document.getElementById(id));
    });
};

// Expor funções globais
window.delete_bspliter = delete_bspliter;
window.delete_splicebox = delete_splicebox;
window.delete_cable = delete_cable;
window.delete_uspliter = delete_uspliter;
window.new_splicebox = new_splicebox;
window.new_cable = new_cable;
window.new_uspliter = new_uspliter;
window.new_bsplite = new_bspliter;
window.read_files = read_files;
window.handle_limit_click = handle_limit_click;
window.new_session = handle_new_session_click;

export { get_limit, get_mode, set_mode, show_download_button, hide_download_button, get_selected, read_files, fill_selects };
