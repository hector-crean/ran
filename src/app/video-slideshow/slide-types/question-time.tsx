import { useState, createContext, useContext, Fragment } from "react";

import { AnimatePresence } from "motion/react";

import styles from "./questionTime.module.css";

interface QuestionTimeProps {
  poster: string;
  title: string;
  questions: object;
}

const QuestionTime = ({
  poster,
  title,
  questions: currentQuestions,
}: QuestionTimeProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const QuizContext = createContext({
    questions: currentQuestions,
  });
  const { questions } = useContext(QuizContext);

  const Box = ({ children, variant, color, index, handleClick, isCorrect }) => {
    const variants = {
      title: {
        background: color ? color : "#ffffff99",
        color: "#324e80",
        fontSize: "2rem",
        fontWeight: "bold",
      },
      question: { background: color ? color : "#8f14dd99", color: "white" },
      option: {
        background: color ? color : "#324e8099",
        cursor: "pointer",
        color: "white",
      },
    };
    return (
      <div
        onClick={handleClick ? () => handleClick(index, isCorrect) : null}
        className={styles.box}
      >
        <div
          className={styles["box-inner"]}
          style={{
            ...variants[variant],
          }}
        >
          {children}
        </div>
      </div>
    );
  };

  const Answers = ({ currentQuestion }) => {
    const [correct, setCorrect] = useState(null);

    const checkSelected = (answer, isCorrect) => {
      setCorrect(answer);
      if (isCorrect) {
        const nextQuestion = currentQuestion + 1;
        if (nextQuestion < Object.keys(questions).length) {
          setCurrentQuestion(currentQuestion + 1);
        }
      }
    };

    return questions[currentQuestion].options.map((option, index) => (
      <Box
        key={option.answer}
        index={index}
        variant={"option"}
        color={correct === index && option.isCorrect ? "green" : null}
        handleClick={checkSelected}
        isCorrect={option.isCorrect}
      >
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "2.5rem",
              height: "2.5rem",
              borderRadius: "2rem",
              backgroundColor: "#d3ddedaa",
              textTransform: "uppercase",
              fontWeight: "bold",
              fontSize: "1.5rem",
            }}
          >
            {index + 1}
          </div>
          <div>
            <p>{option.answer}</p>
          </div>
        </div>
      </Box>
    ));
  };

  return (
    <QuizContext.Provider value={{ questions: currentQuestions }}>
      <div className="relative isolate h-full w-full">
        <img
          src={poster}
          alt="Freeze Frame"
          className="-z-0 h-full w-full object-cover"
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <AnimatePresence>
            <Box variant={"title"}>{title}</Box>
            {questions && Object.keys(questions) ? (
              <Fragment key={currentQuestion}>
                <Box index={currentQuestion + 1} variant={"question"}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <p>Question {currentQuestion + 1}:</p>
                    <p style={{ fontStyle: "italic" }}>
                      {questions[currentQuestion].question}
                    </p>
                  </div>
                </Box>
                <Answers
                  options={questions[currentQuestion].options}
                  currentQuestion={currentQuestion}
                />
              </Fragment>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </QuizContext.Provider>
  );
};

export { QuestionTime };

export type { QuestionTimeProps };
