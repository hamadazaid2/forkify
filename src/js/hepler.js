// We put here all the functions that we use it again and again
import { async } from "regenerator-runtime";
import { TIMEOUT_SEC } from "./config.js";


// This is a timeout for a long time requests
const timeout = function (s) {
    return new Promise(function (_, reject) {
        setTimeout(function () {
            reject(new Error(`Request took too long! Timeout after ${s} second`));
        }, s * 1000);
    });
};

// AJAX is replacment for getJSON and sendJSON
export const AJAX = async function (url, uploadData = undefined) {
    try {
        const fetchPro = uploadData ? fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        }) : fetch(url);

        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} ${res.status}`);
        return data;
    } catch (error) {
        throw error;
    }
}


/*
export const getJSON = async function (url) {
    try {
        // If the request take a certien time to do the request then it will reject
        // console.log(url);
        const res = await Promise.race([fetch(url), timeout(TIMEOUT_SEC)]);
        const data = await res.json();
        // console.log(res);

        if (!res.ok) throw new Error(`${data.message} ${res.status}`);
        return data;
    } catch (error) {
        // We want to handle the error not here, we want to handle it in model.js, so we need to throw the error there ! 
        throw error;
    }
}

export const sendJSON = async function (url, uploadData) {
    try {
        const fetchPro = fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        })
        const res = await Promise.race([fetchPro, timeout(TIMEOUT_SEC)]);
        const data = await res.json();

        if (!res.ok) throw new Error(`${data.message} ${res.status}`);
        return data;
    } catch (error) {
        throw error;
    }
}
*/