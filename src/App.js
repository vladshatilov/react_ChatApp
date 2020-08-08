import React, { Component, useState, useEffect} from 'react';
import './App.css';
import useInput from './useInput.js';
import PubNub from 'pubnub';
import {Card, CardActions, CardContent,List, ListItem,Button,Typography,Input} from '@material-ui/core';
import Header from './Header.js';

class App extends Component {
	constructor(props){
		super(props);

		

		let defaultChannel = "Global";
		// const [channel,setChannel] = useState(defaultChannel);
		// const [messages,setMessages] = useState([]);
		// const [username,] = useState(['user', new Date().getTime()].join('-'));
		// const tempChannel = useInput();
		// const tempMessage = useInput();
		this.state = {
			messages: [],
			channelName: defaultChannel,
			newMessage: "",
			newChannel: "",
		}

		
		this.username = 'undefined';
		// this.pubnub.init(this);
	}
	

	handleNewName = (name) =>{
		console.log(name);
		this.username = name;
		this.startPubNub();
		// if (event.key === 'Enter') {
		// 	this.publishMessage();
		// }
	}

	startPubNub = () => {
		// const [channel,setChannel] = useState(this.defaultChannel);
		// const [messages,setMessages] = useState([]);
		// const [username,] = useState(['user', new Date().getTime()].join('-'));
		// const tempChannel = useInput();
		// const tempMessage = useInput();

		this.pubnub = new PubNub({
			publishKey: "pub-c-954e6edf-f654-4196-87e1-c4aadd22220e",
			subscribeKey: "sub-c-b8e4093c-d8c1-11ea-b3f2-c27cb65b13f4",
			uuid: this.username
			});
		this.pubnub.subscribe({
			channels: [this.state.channelName]
			});

		//Our message event handler - adds in every message we receive to our messages state
		// pubnub.getMessage(this.state.channelName, (msg) => {
		// 		console.log("Message Received: ",msg);
		// 		if(msg.message.text != null){
		// 			let messages = this.state.messages;
		// 			messages.push(
		// 				<Message key={ this.state.messages.length } uuid={ msg.message.uuid } text={ msg.message.text }/>
		// 			);
		// 			this.setState({
		// 					messages: messages
		// 			});
		// 		}

		// });

		this.pubnub.history(
	{
		channel: this.state.channelName,
		count: 10, // 100 is the default
		stringifiedTimeToken: true // false is the default
	},(status, response) => {

		let messages = this.state.messages;
		let i;
		for (i	= 0; i < response.messages.length;i++){
			console.log();
			messages.push(
			<Message key={ this.state.messages.length } uuid={ response.messages[i].entry.uuid } text={ response.messages[i].entry.text }/>
			);
		}
		this.setState({
			messages: messages
		});
		}
	);
		}

componentWillUnmount() {
		this.shutDownPubNub();
	}

	shutDownPubNub = () => {
		this.pubnub.unsubscribe({
				channels: [this.state.channelName]
		});
		this.setState({messages: []});
	}


	//Publishing messages via PubNub
	 publishMessage = () => {
		if (this.state.newMessage) {
			let messageObject = {
				text: this.state.newMessage,
				uuid: this.username
			};
			this.pubnub.publish({
				message: messageObject,
				channel: this.state.channelName
			})
			this.setState({ newMessage: '' })
		}
	}

	handleMessageChange = (event) => {
	this.setState({ newMessage: event.target.value });
	}

	handleNewMessage = (event) =>{
	if (event.key === 'Enter') {
		this.publishMessage();
	}
	}
	// pubnub.addListener({
 //		status: function(statusEvent) {
 //			if (statusEvent.category === "PNConnectedCategory") {
 //			console.log("Connected to PubNub!")
 //			}
 //		},
 //		message: function(msg) {
 //			if(msg.message.text){
 //			let newMessages = [];
 //			newMessages.push({
 //				uuid:msg.message.uuid,
 //				text: msg.message.text
 //			});
 //			setMessages(messages=>messages.concat(newMessages))
 //			}
 //		}
 //		});
	render() {
		return (
			<div>
			<Header setNameInChat={this.handleNewName} />
			<div className={this.props.root}>
				<ChatLog messages={this.state.messages}/>
			</div>
			<CardActions>
			<Input
				placeholder="Enter a message"
				fullWidth={true}
				value={this.state.newMessage}
				className={this.props.input}
				onKeyDown={this.handleNewMessage}
				onChange={this.handleMessageChange}
				inputProps={{
				'aria-label': 'Description',
				}}
				autoFocus={true}
			/>
			<Button
				size="small"
				color="primary"
				onClick={this.publishMessage}>
				Submit
			</Button>

			</CardActions>
			</div>
		);
	}
}


//Simple componentthat renders the chat log
class ChatLog extends Component{

	render(){
		return(
			<List component="nav">
				<ListItem>
				<Typography component="div">
					{ this.props.messages }
				</Typography>
				</ListItem>
			</List>
		)
	}
}

//Our message commponent that formats each message.
class Message extends Component{
	render () {
		return (
			<div >
				{ this.props.uuid }: { this.props.text }
			</div>
		);
	}
};

export default App;
