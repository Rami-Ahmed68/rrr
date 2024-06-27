const CheckAdmin = (admin) => {
    if (admin.is_admin == true) {
        return true
    } else {
        return false;
    }
}

module.exports = CheckAdmin;