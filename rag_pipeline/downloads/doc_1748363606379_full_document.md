

---

## Page 1

---

| Semester | S.E. Semester IV |
| :-- | :-- |
| Subject | Computer Organization and Architecture |
| Professor In-charge | Prof. Amol Sakhalkar |
| Subject Professor In-charge | Prof. Arun Chavan |
| Laboratory | L05 |
| Student Name | Sanika Sonavane |
| Roll Number | 23108A0058 |
| Grade and Subject Teacher's <br> Signature |  |
| Experiment Number | 11 |
| Experiment Title | Mini project: Typing speed tester |
| Resources / Apparatus | Hardware: <br> IBM PC Compatible Computer System |

# TYPING SPEED TESTER 

| Label Symbol | Assembly (Mnemonics) Language Code | Comments |
| :-- | :-- | :-- |
| - | .MODEL SMALL | Define memory model |
| - | .STACK 100H | Define stack size |
| - | .DATA | Start of data segment |
| PROMPT | DB 'Type this sentence: $\$$ ' | Prompt message |
| SENTENCE | DB 'the quick brown fox jumps over the lazy dog\$',13,10,'\$' | Sentence to be typed |
| TYPED | DB 100 DUP(?) | Buffer for user input |
| MSG_DONE | DB 13,10,'Done!\$' | Message after completion |
| MSG_SPEED | DB 13,10,'Typing speed: $\$$ ' | Label for result |
| CPS_LABEL | DB ' CPS\$' | CPS unit label |

---

## Page 2

---

|  Label Symbol | Assembly (Mnemonics) Language Code | Comments  |
| --- | --- | --- |
|  - | .DATA ENDS | End of data segment  |
|  - | .CODE | Start of code segment  |
|  - | MAIN: | Main label  |
|  - | MOV AX, @DATA | Load address of data segment  |
|  - | MOV DS, AX | Initialize DS with data segment  |
|  - | MOV AH, 09H | Display function  |
|  - | LEA DX, PROMPT | Load prompt address  |
|  - | INT 21H | Display prompt  |
|  - | LEA DX, SENTENCE | Load sentence address  |
|  - | INT 21H | Display sentence  |
|  - | CALL GET_TIME | Get start time  |
|  - | MOV BX, DX | Store start time  |
|  - | LEA SI, TYPED | Point SI to input buffer  |
|  - | XOR CX, CX | Reset character count  |
|  READ_LOOP | MOV AH, 01H | Read character with echo  |
|  - | INT 21H | Wait for key input  |
|  - | CMP AL, 13 | Check if Enter pressed  |
|  - | JE INPUT_DONE | Jump if done  |
|  - | MOV [SI], AL | Store character  |
|  - | INC SI | Next buffer location  |
|  - | INC CX | Increment character count  |
|  - | JMP READ_LOOP | Repeat input loop  |

---

## Page 3

---

|  Label Symbol | Assembly (Mnemonics) Language Code | Comments  |
| --- | --- | --- |
|  INPUT_DONE | MOV BYTE PTR [SI], '$' | Null-terminate input  |
|  - | CALL GET_TIME | Get end time  |
|  - | MOV AX, DX | Load end time  |
|  - | SUB AX, BX | Calculate time diff (ticks)  |
|  - | CMP AX, 0 | Avoid zero division  |
|  - | JNE TIME_OK | Jump if valid  |
|  - | MOV AX, 1 | Set AX to 1 if ticks $=0$  |
|  TIME_OK | MOV BX, AX | Store ticks in BX  |
|  - | MOV AX, CX | Load character count  |
|  - | XOR DX, DX | Clear DX  |
|  - | DIV BX | Divide to get CPS  |
|  - | MOV AH, 09H | Display function  |
|  - | LEA DX, MSG_DONE | Message for done  |
|  - | INT 21H | Display message  |
|  - | LEA DX, MSG_SPEED | Load CPS label  |
|  - | INT 21H | Display label  |
|  - | CALL PRINT_NUM | Print calculated CPS  |
|  - | LEA DX, CPS_LABEL | Load " CPS"  |
|  - | INT 21H | Display unit  |
|  - | MOV AH, 4CH | Exit program  |
|  - | INT 21H | Call DOS interrupt  |
|  GET_TIME | MOV AH, 00H | BIOS call to get time  |

---

## Page 4

---

|  Label Symbol | Assembly (Mnemonics) Language Code | Comments  |
| --- | --- | --- |
|  - | INT 1AH | Call BIOS  |
|  - | MOV DX, DX | DX holds timer ticks  |
|  - | RET | Return from subroutine  |
|  PRINT_NUM | MOV BX, 10 | For decimal division  |
|  - | XOR CX, CX | Digit counter  |
|  NEXT_DIGIT | XOR DX, DX | Clear remainder  |
|  - | DIV BX | Divide AX by 10  |
|  - | PUSH DX | Store digit  |
|  - | INC CX | Count digits  |
|  - | CMP AX, 0 | Continue if more digits  |
|  - | JNE NEXT_DIGIT | Loop  |
|  PRINT_LOOP | POP DX | Get digit  |
|  - | ADD DL, '0' | Convert to ASCII  |
|  - | MOV AH, 02H | Print char function  |
|  - | INT 21H | Display digit  |
|  - | LOOP PRINT_LOOP | Continue until all digits  |
|  - | RET | End subroutine  |
|  - | END MAIN | End of program  |

---

## Page 5

---

- Displays a sentence to type
- Records the time it takes for the user to type it
- Compares the typed input with the original sentence
- Calculates typing speed in characters per second (CPS)
- Timer using BIOS interrupts
- Character-by-character input
- Real-time input feedback
- Basic speed calculation

```
Type this sentence:
the quick brown fox jumps over the lazy dog
the quick brown fox jumps over the lazy dog
Done!
Typing speed: 3 CPS
```


# Line 

Type this sentence:
the quick brown fox...lazy dog
(user types here)
Done!

Typing speed: 3 CPS

## What it Does

Prompt message shown using int 21h, ah=09h
Sentence the user is supposed to type
As user types the sentence, each keystroke is echoed back
Displayed after pressing Enter
Displays the speed in Characters Per Tick ( 1 tick $=55 \mathrm{~ms}$ )