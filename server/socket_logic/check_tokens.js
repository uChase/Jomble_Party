const controllerToken = 'SECURE_CONTROLLER_TOKEN'; // Replace with a securely generated token for each unity game


function check_controller_token(token){
    return token === controllerToken;
}

module.exports = {check_controller_token};