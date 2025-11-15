import React, { useState, useEffect } from 'react';

/**
 * QuestionRenderer Component
 * Displays certification exam questions with options
 * Handles both single-answer and multi-answer questions
 *
 * @param {Object} question - Question object with id, text, options, is_multiple_correct
 * @param {Array} selectedAnswers - Currently selected option IDs
 * @param {function} onAnswerChange - Callback when answer is selected
 * @param {number} questionNumber - Question number for display
 * @param {number} totalQuestions - Total questions in exam
 */
const QuestionRenderer = ({
  question,
  selectedAnswers = [],
  onAnswerChange,
  questionNumber = 1,
  totalQuestions = 1
}) => {
  const [answered, setAnswered] = useState(selectedAnswers.length > 0);

  useEffect(() => {
    setAnswered(selectedAnswers.length > 0);
  }, [selectedAnswers]);

  const handleOptionChange = (optionId) => {
    let newAnswers;

    if (question.is_multiple_correct) {
      // Multi-answer: toggle selection
      if (selectedAnswers.includes(optionId)) {
        newAnswers = selectedAnswers.filter(id => id !== optionId);
      } else {
        newAnswers = [...selectedAnswers, optionId];
      }
    } else {
      // Single-answer: replace selection
      newAnswers = selectedAnswers[0] === optionId ? [] : [optionId];
    }

    onAnswerChange(question.id, newAnswers);
  };

  const isMultipleChoice = question.is_multiple_correct;

  return (
    <div className="space-y-6 select-none">
      {/* Question Header */}
      <div className="text-xl font-semibold text-gray-700 bg-gray-50 p-3 rounded-lg border-l-4 border-blue-500 shadow-sm select-none"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none'
        }}>
        Question {questionNumber} of {totalQuestions}
        <span className="text-sm font-normal ml-3 text-gray-500">
          ({isMultipleChoice ? 'Select multiple options' : 'Select one option'})
        </span>
      </div>

      {/* Question Text */}
      <p
        className="text-2xl font-bold text-gray-900 leading-relaxed bg-white p-6 rounded-xl shadow-inner border border-gray-100 select-none"
        style={{
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          WebkitTouchCallout: 'none'
        }}
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => e.preventDefault()}
        onCut={(e) => e.preventDefault()}
        onDrag={(e) => e.preventDefault()}
      >
        {question.text}
      </p>

      {/* Multiple Choice Indicator */}
      {isMultipleChoice && (
        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
          ℹ️ This question has multiple correct answers
        </div>
      )}

      {/* Options */}
      <div className="space-y-3">
        {question.options && question.options.map(option => {
          const isSelected = selectedAnswers.includes(option.id);
          const baseStyle = "flex items-center p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-md";
          const activeStyle = isSelected ? 'bg-blue-600 text-white shadow-xl ring-4 ring-blue-300 transform scale-[1.02]' : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-200';
          const iconShape = isMultipleChoice ? 'rounded-md' : 'rounded-full';

          return (
            <div
              key={option.id}
              className={`${baseStyle} ${activeStyle} select-none`}
              style={{
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
              onClick={() => handleOptionChange(option.id)}
              onContextMenu={(e) => e.preventDefault()}
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onDrag={(e) => e.preventDefault()}
            >
              <span className={`w-6 h-6 border-2 flex items-center justify-center mr-4 transition-colors duration-200 ${iconShape} ${isSelected ? 'bg-white border-white' : 'border-gray-300'}`}>
                {isSelected && (
                  <svg className={`w-4 h-4 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    {isMultipleChoice ? (
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    ) : (
                      <circle cx="12" cy="12" r="6" />
                    )}
                  </svg>
                )}
              </span>
              <span className={`text-lg font-medium ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                {option.text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Answer Status */}
      <div className="mt-4">
        {answered ? (
          <div className="text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">
            ✅ Answer recorded
          </div>
        ) : (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded border border-orange-200">
            ⏳ Answer required
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionRenderer;
