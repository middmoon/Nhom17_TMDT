import axios from "axios";
import Cookies from "js-cookie";
const urlLogin = "http://localhost:3030/api/v1/access/login";
const urlLogout = "http://localhost:3030/api/v1/access/logout";

const loginHeaders = {
  "Content-Type": "application/json",
};
const logoutHeaders = {
  "Content-Type": "application/json",
};

axios.defaults.withCredentials = true;

export const loginUser = async (user, setError, navigate) => {
  try {
    const r = await axios.post(urlLogin, user, loginHeaders);

    const data = {
      message: r.data.message,
      statusCode: r.data.statusCode,
      metadata: {
        accessToken: r.data.metadata.accessToken,
      },
    };
    navigate("/");
    window.location.reload();
    return data;
  } catch (error) {
    // Xử lý lỗi
    setError("Tên tài khoản hoặc mật khẩu không đúng");
  }
};

export const logoutUser = async (navigate, setError) => {
  try {
    await axios.delete(urlLogout, logoutHeaders);
    navigate("/");
    window.location.reload();
  } catch (error) {
    console.error("Lỗi khi logout", error);
    setError("Đã xảy ra lỗi khi đăng xuất.");
  }
};
