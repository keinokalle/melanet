import { useEffect, useState } from 'react'
import usersService from '../../services/users'

function TestUser() {
  const [users, setUsers] = useState([])

  useEffect(() => {
    usersService.getAll().then(data => setUsers(data))
  }, [])

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user, idx) => (
          <li key={user.id || idx}>
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default TestUser
