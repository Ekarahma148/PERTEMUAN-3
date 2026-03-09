import jwt from "jsonwebtoken";

// Middleware otentikasi
export const verifyToken = (req, res, next) => {
  // Prioritas pengambilan token: Cookies -> Header Authorization
  const token = req.cookies.token || (req.headers.authorization?.startsWith("Bearer ") && req.headers.authorization.split(" ")[1]);

  if (!token) {
    return res.status(401).json({ message: "Anda belum login (token tidak ditemukan)." });
  }

  try {
    // Verifikasi token
    req.user = jwt.verify(token, process.env.SECRET_KEY);
    next(); // Lanjut ke endpoint berikutnya jika token valid
  } catch (error) {
    res.status(403).json({ message: "Token tidak valid atau telah kedaluwarsa.", error: error.message });
}
};
