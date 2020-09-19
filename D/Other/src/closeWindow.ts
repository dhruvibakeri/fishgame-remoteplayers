import { EventEmitter } from "events"
const emitter = new EventEmitter();

const closeWindow = (): void => {
    console.log('window closing');
    emitter.emit('closed');
    // window.close();
}

const hexagon = document.getElementById('hexagon')
hexagon.addEventListener("click", (e: MouseEvent) => closeWindow());