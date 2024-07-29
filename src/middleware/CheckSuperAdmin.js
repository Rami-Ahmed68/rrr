const CheckSuperAdmin = (admin) => {
  if (admin.is_supper_admin == true) {
    return true;
  } else {
    return false;
  }
};

module.exports = CheckSuperAdmin;
