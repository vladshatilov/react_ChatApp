import React, { Component, useState, useEffect} from 'react';
import './App.css';
import useInput from './useInput.js';
import PubNub from 'pubnub';
import {Card, CardActions, CardContent,List, ListItem,Button,Typography,Input} from '@material-ui/core';
import Header from './Header.js';

import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';

import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';
import imageForChat from './img.jpg';

class App extends Component {
	constructor(props){
		super(props);

		

		let defaultChannel = "test3";
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
			showPicker: false,
		}

		
		this.username = 'undefined';
		// this.showPicker = false;
		// this.pubnub.init(this);
	}
	
	// handleNewOutMessage = (msg) => {
	// 	console.log('new mess');
	// 	console.log(msg);
	// }


// 	this.pubnub.deleteMessages(
//     {
//         channel: 'test',
//         start: '1293829200000',
//         end: '1609448400000'
//     },
//     (result) => {
//         console.log(result);
//     }
// );


	handleNewName = (name) => {
		console.log(name);
		console.log(new Date(2011, 0, 1).getTime());
		console.log(new Date(1508850607692));
		console.log(new Date(2021, 0, 1).getTime());
		this.username = name;
		this.startPubNub();


		// if (event.key === 'Enter') {
		// 	this.publishMessage();
		// }
		// [].forEach.call(this.pubnub, function(pubnub){
		// 	pubnub.addEventListener("message", this.handleNewOutMessage(),false);
		// });
		// console.log(this.state.messages);
		this.pubnub.addListener({    
		// status: function(statusEvent) {
  //         if (statusEvent.category === "PNConnectedCategory") {
  //           console.log("Connected to PubNub!")
  //         }
  //       },    
        message: (msg) => {
        	console.log(msg);
        	console.log(this.state);
        	console.log(msg.channel);
        	if (msg.channel === this.state.channelName){
          if(msg.message.text){
          	// console.log(msg.message.text);
            // let newMessages = [];
            // newMessages.push({
            //   uuid:msg.message.uuid,
            //   text: msg.message.text
            // });
            // setMessages(messages=>messages.concat(newMessages))
            console.log(this.username==msg.message.self);
            console.log(this.username);
            console.log(this.username==msg.message.uuid);

            let messages = this.state.messages;
			
			// console.log(msg.message.uuid);
					messages.push(
					<Message key={ this.state.messages.length } uuid={ msg.message.uuid } text={ msg.message.text } self={this.username==msg.message.uuid} time={ msg.message.time } />
					);
				
				this.setState({
					messages: messages
				});
          }}
        }
      });

// 		this.pubnub.deleteMessages(
//     {
//         channel: 'Global',
//         start: '1293829200000',
//         end: '1609448400000'
//     },
//     (result) => {
//         console.log(result);
//     }
// );
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
			channels: [this.state.channelName,'test4']
			// channels: [this.state.channelName]
			});
		this.historyUpdate();

		
		// this.pubnub.getMessage(this.state.channelName, (msg) => {
	 //        console.log("Message Received: ",msg);
	 //    });


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

		
		}
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
					console.log();
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
	

	//Publishing messages via PubNub
	publishMessage = () => {
		if (this.state.newMessage) {
			let timePublish = new Date();
			let messageObject = {
				text: this.state.newMessage,
				uuid: this.username,
				time : `${timePublish.getHours()}:${('0'+(timePublish.getMinutes()).toString()).slice(-2)}`,
				self: true
			};
			console.log(messageObject);
			if(this.pubnub){
			this.pubnub.publish({
				message: messageObject,
				channel: this.state.channelName,
				
			})
		}
			// this.historyUpdate();
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

	handleChannelChange = (event,index) => {
		console.log(index);
		if (index) {
			// this.setState({ channelName: 'test' });
			this.setState({
				channelName: 'test4'
			}, () => {
				this.historyUpdate();
			});
			// this.historyUpdate();
		}
		else {
			this.setState({
				channelName: 'test3'
			}, () => {
				this.historyUpdate();
			});
			// this.setState({ channelName: 'Global' });
			// this.historyUpdate();
		}
	}
	addEmoji = (emoji) => {
		console.log(`${emoji.native}`);
		this.setState({ newMessage: [this.state.newMessage + emoji.native] });
	}

	togglePicker = () => {
	    this.setState ({showPicker : !this.state.showPicker});

	    console.log(this.state.showPicker);
	  };
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

//
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




//Simple componentthat renders the chat log
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

//Our message commponent that formats each message.
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
