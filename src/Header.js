import React,{useState} from 'react';
import './Header.css'
import logo from './chat_icon.svg';

// import RoomTitle from '../room-title/RoomTitle';
// <RoomTitle chatroomName={props.chatRoomName} />
function Header(props) {

	const [name, setName] = useState('')
	
	const handleChangeName = (e) => {
		setName(e.target.value)
	}
	const handleNewMessage = (event) => {
		if (event.key === 'Enter') {
			props.setNameInChat(name);
            document.getElementById("NameHolder").disabled = true;
		}
	}
	return (
		<header className="headerClassHolder">
			<div className="LogoHeader">
				<img src={logo} className="App-logo" alt="Chatix logo" />
			</div>
			<div className="RoomTitle">
				<h1>{'Mini slack'}</h1>
			</div>
			{
				true ?
					<input
                        id="NameHolder"
						className = 'name-input'
						value = {name}
						placeholder = 'Type your name to connect'
						onChange = {(e) => handleChangeName(e)}
						onKeyDown={(e) => handleNewMessage(e)}
						/>
				: null
			}
		</header>
	);
}

export default Header;