import React, { Component, useState, useEffect} from 'react';
import './App.css';

		//Using Pubnub as chat core
import PubNub from 'pubnub';
import {Card, CardActions, CardContent,List, ListItem,Button,Typography,Input} from '@material-ui/core';
import Header from './Header.js';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

		//and emoji-mart module to use emoji in chat
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import imageForChat from './img.jpg';

class App extends Component {
	constructor(props){
		super(props);

		

		let defaultChannel = "work_init";
		this.state = {
			messages: [],
			channelName: defaultChannel,
			newMessage: "",
			newChannel: "",
			showPicker: false,
		}

		
		this.username = 'undefined';
	}
	
			//setting username and starting chat core
	handleNewName = (name) => {
		this.username = name;
		this.startPubNub();

				//listener to receive new message in real-time
		this.pubnub.addListener({	
		message: (msg) => {
			if (msg.channel === this.state.channelName){
			if(msg.message.text){
				let messages = this.state.messages;
				messages.push(
					<Message key={ this.state.messages.length } uuid={ msg.message.uuid } text={ msg.message.text } self={this.username==msg.message.uuid} time={ msg.message.time } />
				);
				
				this.setState({
					messages: messages
				});
			}}
		}
		});
	}

			//connect to my room and subscribe to channels (needed to receive messages)
	startPubNub = () => {
		this.pubnub = new PubNub({
			publishKey: "pub-c-954e6edf-f654-4196-87e1-c4aadd22220e",
			subscribeKey: "sub-c-b8e4093c-d8c1-11ea-b3f2-c27cb65b13f4",
			uuid: this.username
			});
		this.pubnub.subscribe({
			channels: [this.state.channelName,'talk_init']
			});
		this.historyUpdate();	
	}

			//updating history on connecting to the chat or switching between chats/channels
	historyUpdate = () => {
		this.setState({
					messages: []
				});
		if(this.pubnub){
		this.pubnub.history(
			{
				channel: this.state.channelName,
				count: 100, // 100 is the default
				stringifiedTimeToken: true // false is the default
			},(status, response) => {

				let messages = this.state.messages;
				let i;
				for (i	= 0; i < response.messages.length;i++){
					messages.push(
					<Message key={ this.state.messages.length } uuid={ response.messages[i].entry.uuid } text={ response.messages[i].entry.text} self={this.username==response.messages[i].entry.uuid} time={response.messages[i].entry.time} />
					);
				}
				this.setState({
					messages: messages
				});
				}
			);
		}		
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
	

		//Publishing messages via PubNub in case 'enter button' or click on 'send'
	publishMessage = () => {
		if (this.state.newMessage) {
			let timePublish = new Date();
			let messageObject = {
				text: this.state.newMessage,
				uuid: this.username,
				time : `${timePublish.getHours()}:${('0'+(timePublish.getMinutes()).toString()).slice(-2)}`,
				self: true
			};

			if(this.pubnub){
				this.pubnub.publish({
					message: messageObject,
					channel: this.state.channelName,
					
				})
		}
			this.setState({ newMessage: ''})
			if (this.state.showPicker) {
				this.setState({showPicker : !this.state.showPicker})
			}
			document.getElementById("typeMessageForm").focus(); 
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


			// Updating history only after updating channels (because setState make it async)
	handleChannelChange = (event,index) => {
		if (index) {
			this.setState({
				channelName: 'talk_init'
			}, () => {
				this.historyUpdate();
			});
		}
		else {
			this.setState({
				channelName: 'work_init'
			}, () => {
				this.historyUpdate();
			});
		}
	}

			// Adding emoji :)
	addEmoji = (emoji) => {
		this.setState({ newMessage: [this.state.newMessage + emoji.native] });
	}

			// Turn off emoji dialog window
	togglePicker = () => {
		this.setState ({showPicker : !this.state.showPicker});
		};

			// Chat consist of header, channel frame, chat frame and input with send form 
	render() {
		return (
			<div className={"AppWindow"}>
			<Header setNameInChat={this.handleNewName} />
			<div className={'chatWindow'} >
				<div className={'channelListSideBar'} ><ChannelList selectChannel={(e,i) => this.handleChannelChange(e,i)} />
				</div>
				<div className={'chatAndMessageWindow'} ><ChatLog messages={this.state.messages}/>
				<CardActions>
			
				<Input 
					id={"typeMessageForm"}
					className={'inputFieldClass'}
					placeholder="Type here..."
					fullWidth={true}
					value={this.state.newMessage}
					onKeyDown={this.handleNewMessage}
					onChange={this.handleMessageChange}
					maxlength="15"
					inputProps={{
					'aria-label': 'Description',
					}}
					autoFocus={true}
				/>
				<div className = "pickerStyle">
				{this.state.showPicker ? (<Picker
					
					emoji=""
					title=""
					native={true}
					onSelect={ this.addEmoji}
					/>):null}
				</div>
				
				<Button className={"butForSmile"} onClick={this.togglePicker}>☺</Button>
			<Button
				size="small"
				color="primary"
				onClick={this.publishMessage}>
				Send
			</Button>
			

			</CardActions>
			</div>
			</div>
			
			</div>
		);
	}
}

		//setting up channel list and perform its change through react useState and props.selectChannel func
function ChannelList(props){
	const [selectedIndex, setSelectedIndex] = React.useState(0);
	const handleListItemClick = (event, index) => {
		setSelectedIndex(index);
		props.selectChannel(event,index);
		};
		return(
			<div className={'classesroot'}>
				<List component="nav" aria-label="main mailbox folders">
				<ListItem
					button
					selected={selectedIndex === 0}
					onClick={(event) => handleListItemClick(event, 0)}
				>
					<ListItemIcon>
					</ListItemIcon>
					<ListItemText primary="Work" />
				</ListItem>
				<ListItem
					button
					selected={selectedIndex === 1}
					onClick={(event) => handleListItemClick(event, 1)}
				>
					<ListItemIcon>
					</ListItemIcon>
					<ListItemText primary="Talk" />
				</ListItem>
				</List>				
			</div>
		)
	}




		//Simple component that renders the chat log and scroll it to the end
function ChatLog(props){
	const messagesContainer = React.createRef();
	useEffect(() => {
		messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight
	}, [props, messagesContainer]);
	
		return(
			<List className={"listMessageFrame"} component="nav" ref={messagesContainer}>
				<ListItem>
				<Typography component="div">
					{ props.messages }
				</Typography>
				</ListItem>
			</List>
		)
	
}

		//Message commponent that set format for each message
class Message extends Component{
	render () {
		return (
			<div >
				<div>
					<span className = "nameStump" >{this.props.uuid} </span>
					<span className = "timeStump" >{this.props.time} </span>
				</div>		

				{this.props.self ? (
					<div className = "messageStumpSelf" >
						{ this.props.text }
					</div>
				):
					<div className = "messageStump" >
						{ this.props.text }
					</div>
				}
			</div>
		);
	}
};

export default App;
