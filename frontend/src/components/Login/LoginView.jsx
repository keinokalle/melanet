import { useState } from 'react'
import loginService from '../../services/login'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Alert from 'react-bootstrap/Alert';

function LoginView({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await loginService.login({ username, password })
      console.log('vastaus', response);
      
      // Store the token in localStorage
      localStorage.setItem('token', response.token)
      localStorage.setItem('username', response.username)
      localStorage.setItem('name', response.name)
      localStorage.setItem('userId', response.id)
      
      // Notify parent component of successful login
      onLoginSuccess(response)
      
      setUsername('')
      setPassword('')
    } catch (error) {
      console.error('Login error:', error)
      setError(error.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <Form onSubmit={handleLogin}>
      <h2 className='mb-3'>Log in</h2>
      {error && <Alert key={'warning'} variant={'warning'}>{error}</Alert>}
      <Form.Group className="mb-3" controlId="formBasicUsername">
        <Form.Label>Username</Form.Label>
        <Form.Control type="username" autoComplete="username" placeholder="Enter username" value={username} onChange={e => setUsername(e.target.value)} required/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required/>
      </Form.Group>
      <Form.Text className="text-muted">
          We'll never share your email with anyone else.
      </Form.Text>
      <Form.Group className="mb-3" controlId="formBasicSubmit">
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </Button>
      </Form.Group>

    </Form>
    /**
     * 
     
    <div>
      
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div>
          <label>
            Username:
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
    
  */
  )
}

export default LoginView
