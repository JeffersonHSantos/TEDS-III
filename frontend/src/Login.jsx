import { useState } from "react"
import { Button, Form } from "react-bootstrap"
import { login } from "./services/auth"


function Login() {

    const [email, setEmail] = useState("")
    const [senha, setSenha] = useState("")

    async function handleLogin(event) {
        event.preventDefault()
        
        const data = await login({email, senha})
        localStorage.setItem("token", data.token)

        //localStorage.getItem("token")
    }

    return(
        <>
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label>Email address</Form.Label>
                    <Form.Control 
                        type="email"
                        placeholder="name@example.com" 
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password"
                        placeholder="Digite sua Senha"
                        onChange={(e) => setSenha(e.target.value)}
                    />
                </Form.Group>
            </Form>
            <Button variant="primary" size="sm" onClick={handleLogin}>
                Login
            </Button>
        </>
    )
}

export default Login