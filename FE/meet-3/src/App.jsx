import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const API = import.meta.env.VITE_API_BASE_URL;

  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [gmail, setGmail] = useState("");
  const [editId, setEditId] = useState(null);

  // ======================
  // GET DATA
  // ======================
  const getUsers = async () => {
    try {
      const res = await axios.get(API);
      setUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    getUsers();
  }, []);

  // ======================
  // CREATE / UPDATE
  // ======================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API}/${editId}`, { name, gmail });
      } else {
        await axios.post(API, { name, gmail });
      }

      setName("");
      setGmail("");
      setEditId(null);
      getUsers();
    } catch (err) {
      console.log(err);
    }
  };

  // ======================
  // EDIT
  // ======================
  const handleEdit = (user) => {
    setName(user.name);
    setGmail(user.gmail);
    setEditId(user.id);
  };

  // ======================
  // DELETE
  // ======================
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/${id}`);
      getUsers();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>CRUD Users</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="text"
          placeholder="Gmail"
          value={gmail}
          onChange={(e) => setGmail(e.target.value)}
        />
        <button type="submit">
          {editId ? "Update" : "Tambah"}
        </button>
      </form>

      <table border="1" style={{ marginTop: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Gmail</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.gmail}</td>
              <td>
                <button onClick={() => handleEdit(user)}>Edit</button>
                <button onClick={() => handleDelete(user.id)}>
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
