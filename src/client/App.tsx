import * as React from 'react';
import './App.css';

interface AppState {
	questions: any,
	currentQuestion: number,
	correct: number,
	wrong: number
}

export class App extends React.Component<{}, AppState> { 

	constructor(props: any, state: any) {
		super(props);
		this.state = {
			questions: [],
			currentQuestion: 0,
			correct: 0,
			wrong: 0
		}
	}

	componentDidMount() {
		this.getQuestions();
	}

	getQuestions(restart?: boolean) {
		fetch('http://localhost:4000/api/questions')
			.then(results => {
				return results.json();
			})
			.then(data => {
				let questions = this.shuffle(data.results).slice(0, 10);

				questions.map((item: any) => {
					if(item.type === 'multiple'){
						var answers = item.incorrect_answers;
						answers.push(item.correct_answer);
						item.answers = this.shuffle(answers);
					}
				})

				this.setState({questions: questions});

				if(restart){
					this.setState({correct: 0, wrong: 0, currentQuestion: 0});
				}
			})
	}

	shuffle(array: any) {
	    var len = array.length,
	        item, rand;
	    while (len > 0) {
	        rand = Math.floor(Math.random() * len--);
	        item = array[len];
	        array[len] = array[rand];
	        array[rand] = item;
	    }
	    return array;
	}

	render() {
		return (
		    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
		        <h1>Lucid</h1>
		        <h2>Welcome to UI Team code assessment!</h2>

		        {this.state.questions.map((question: any, index: number) => {
		        	return this.renderQuestion(question, index);
		        })}
		        <Summary onRestartQuiz={this.restartQuiz.bind(this)} currentQuestion={this.state.currentQuestion} totalQuestions={this.state.questions.length} correct={this.state.correct} wrong={this.state.wrong}/>
		    </div>
		);
	}

	renderQuestion(question: any, index: number){
		switch(question.type){
			case "multiple":
				return <QuestionMultiple key={index} index={index} currentQuestion={this.state.currentQuestion} onAnswerChange={this.handleAnswerChange.bind(this)} question={question.question} boolean={false} answers={question.answers} correctAnswer={question.correct_answer} shuffle={this.shuffle}/>
			case "boolean":
				return <QuestionMultiple key={index} index={index} currentQuestion={this.state.currentQuestion} onAnswerChange={this.handleAnswerChange.bind(this)} question={question.question} boolean={true} answers={['True', 'False']} correctAnswer={question.correct_answer} shuffle={this.shuffle}/>
			case "text":
				return <QuestionText key={index} index={index} currentQuestion={this.state.currentQuestion} onAnswerChange={this.handleAnswerChange.bind(this)} question={question.question} correctAnswer={question.correct_answer}/>
		}

	}

	handleAnswerChange(answerCorrect: boolean) {
		if(answerCorrect){
			this.setState({correct: this.state.correct + 1, currentQuestion: this.state.currentQuestion + 1});
		}else{
			this.setState({wrong: this.state.wrong + 1, currentQuestion: this.state.currentQuestion + 1});
		}
	}

	restartQuiz() {
		this.getQuestions(true);
	}
}

interface QMProps {
	question: string,
	answers: any,
	correctAnswer: string,
	currentQuestion: number,
	onAnswerChange: any,
	key: number,
	index: number,
	boolean: boolean,
	shuffle: any
}

interface QMState {
	answer: string,
	answers: any
}

class QuestionMultiple extends React.Component<QMProps, QMState> {
	constructor (props: any) {
	       super(props);

	       this.state = {answer: '', answers: []}
	       this.setAnswer = this.setAnswer.bind(this);
	       this.proceed = this.proceed.bind(this);
    }

	render() {
		if(this.props.index !== this.props.currentQuestion){
			return false;
		}else{
			return (
			<div className="question-wrapper">
				<div className="question">{this.convertSafeEntities(this.props.question)}</div>
				{this.props.answers.map((answer: any) => {
					return (
						<label>
							<input type="radio" name={'radio' + this.props.index} value={answer} onClick={this.setAnswer}/>
							<span>{this.convertSafeEntities(answer)}</span>
						</label>
					)
					})
				}
				<button className="next-button" onClick={this.proceed}>Next</button>
			</div>
			)
		}
	}

	proceed(){
		if(typeof this.state.answer !== 'undefined' && this.state.answer !== ''){
			this.props.onAnswerChange(this.state.answer === this.props.correctAnswer);
		}
	}

	setAnswer(e: any){
		this.setState({answer: e.target.value});
	}

	convertSafeEntities(html: string){
		var whitelist: {[key: string]: string} = {
			'&quot;': '"',
			'&#039;': "'",
			'&amp;': '&'
		};

		Object.keys(whitelist).forEach((entity: string) => {
			html = html.replace(new RegExp(entity, 'g'), whitelist[entity]);
		})

		return html;
	}
}

interface QTProps {
	question: string,
	correctAnswer: string,
	currentQuestion: number,
	onAnswerChange: any,
	key: number,
	index: number
}

interface QTState {
	answer: string
}

class QuestionText extends React.Component<QTProps, QTState> {
	constructor (props: any) {
	       super(props);

	       this.state = {answer: ''}
	       this.setAnswer = this.setAnswer.bind(this);
	       this.proceed = this.proceed.bind(this);
    }

    render() {
    	if(this.props.index !== this.props.currentQuestion){
    		return false;
    	}else{
    		return (
    			<div className="questionWrapper">
    				<div className="question">{this.convertSafeEntities(this.props.question)}</div>
    				<input type="text" defaultValue="" onChange={this.setAnswer} />
    				<button className="next-button" onClick={this.proceed}>Next</button>
    			</div>
    		)
    	}
    }

    proceed(){
    	if(typeof this.state.answer !== 'undefined' && this.state.answer !== ''){
    		this.props.onAnswerChange(this.state.answer.toLowerCase() === this.props.correctAnswer.toLowerCase());
    	}
    }

    setAnswer(e: any){
    	this.setState({answer: e.target.value});
    }

    convertSafeEntities(html: string){
    	var whitelist: {[key: string]: string} = {
    		'&quot;': '"',
    		'&#039;': "'",
    		'&amp;': '&'
    	};

    	Object.keys(whitelist).forEach((entity: string) => {
    		html = html.replace(new RegExp(entity, 'g'), whitelist[entity]);
    	})

    	return html;
    }
}

interface SummaryProps {
	currentQuestion: number,
	correct: number,
	wrong: number,
	totalQuestions: number,
	onRestartQuiz: any
}

class Summary extends React.Component<SummaryProps> {
	constructor (props: any) {
	       super(props);
    }

    render() {
    	if(this.props.currentQuestion === 10){
	    	let score: any = Math.round((this.props.correct / this.props.totalQuestions) * 100);
	    	return (
	    		<div className="summary">
	    			<h1>Summary</h1>
	    			<div>
	    				<span className="label">Correct:</span> <span className="summaryValue">{this.props.correct}</span>
	    			</div>
	    			<div>
	    				<span className="label">Wrong:</span> <span className="summaryValue">{this.props.wrong}</span>
	    			</div>
	    			<div>
	    				<span className="label">Questions Answered:</span> <span className="summaryValue">{this.props.totalQuestions}</span>
	    			</div>
	    			<div>
	    				<span className="label">Final Score:</span> <span className="summaryValue">{score}%</span>
	    			</div>
	    			<button className="restart-button" onClick={this.restartQuiz.bind(this)}>Restart Quiz</button>
	    		</div>
	    	)
	    }

	    return false;
    }

    restartQuiz(){
    	this.props.onRestartQuiz();
    }
}