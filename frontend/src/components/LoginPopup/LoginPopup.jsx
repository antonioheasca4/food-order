import React, { useContext, useEffect, useState } from 'react'
import './LoginPopup.css'
import { assets } from '../../assets/assets'
import { StoreContext } from '../../context/StoreContext'
import axios from "axios"

const LoginPopup = ({setShowLogin}) => {

    const {url, setToken, showNotification} = useContext(StoreContext)

    const [currState,setCurrState] = useState("Login")

    const [data,setData] = useState({
      name:"",
      email:"",
      password:""
    })

    const onChangeHandler = (event) => {
      const name = event.target.name
      const value = event.target.value
      setData(data => ({...data,[name]:value}))
    }

    // useEffect(()=>{
    //   console.log(data)
    // },[data])

    // Funcție pentru a verifica dacă utilizatorul este admin
    const checkIfAdmin = async (token) => {
      try {
        const response = await axios.get(`${url}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success && response.data.user && response.data.user.isAdmin) {
          return true;
        }
        return false;
      } catch (error) {
        console.error("Eroare la verificarea rolului utilizatorului:", error);
        return false;
      }
    };

    const onLogin = async (event) => {
       event.preventDefault()

       let newUrl = url;
       if(currState==="Login"){
        newUrl += "/api/user/login"
       }
       else{
        newUrl += "/api/user/register"
       }

       try {
         const response = await axios.post(newUrl, data)

         if(response.data.succes){
           const token = response.data.token;
           
           // Verifică dacă utilizatorul este admin
           const isAdmin = await checkIfAdmin(token);
           
           if (isAdmin) {
             // Dacă este admin, afișăm un mesaj de eroare și nu permitem autentificarea
             alert("Conturile de administrator nu pot fi utilizate în interfața utilizatorului normal. Vă rugăm să utilizați panoul de administrare.");
             return;
           } else {
             // Dacă nu este admin, continuă procesul normal
             setToken(token);
             localStorage.setItem("token", token);
             setShowLogin(false);
           }
         }
         else{
           alert(response.data.message)
         }
       } catch (error) {
         console.error("Eroare la autentificare:", error);
         alert("Eroare la autentificare. Încercați din nou.");
       }
    }

  return (
    <div className='login-popup' >
      <form onSubmit={onLogin} className="login-popup-container">

        <div className="login-popup-title">
            <h2>{currState}</h2>
            <img onClick={()=>setShowLogin(false)} src={assets.cross_icon} alt="" />
        </div>

        <div className="login-popup-inputs">
            {currState==="Login"?<></>:<input name='name' onChange={onChangeHandler} value={data.name} type="text" placeholder='Your name' required />}
            <input name='email' onChange={onChangeHandler} value={data.email}  type="email" placeholder='Your email' required />
            <input  name='password' onChange={onChangeHandler} value={data.password} type="password" placeholder='Password' required />
        </div>

        <button type='submit' >{currState==="Sign up"?"Create account":"Login"}</button>

        <div className="login-popup-condition">
            <input type="checkbox" required />
            <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>

        {currState==="Login"
        ?<p>Create a new account? <span onClick={()=>setCurrState("Sign up")}>Click here</span></p>
        :<p>Already have an account? <span onClick={()=>setCurrState("Login")}>Login here</span></p>}
        
        
      </form>
    </div>
  )
}

export default LoginPopup
