import React, { useState } from "react"; 
import { askQuestion } from "../services/chat"; 
import type { ChatResponse } from "../services/chat";

export default function Chat() {

    const [question, setQuestion] =
      useState("");
  
    const [response, setResponse] =
      useState<ChatResponse | null>(null);
  
    const [loading, setLoading] =
      useState(false);
  
    const [error, setError] =
      useState<string | null>(null);
  
    async function handleSubmit(
      event: React.FormEvent<HTMLFormElement>
    ) {
  
      event.preventDefault();
  
      if (!question.trim()) {
        return;
      }
      
      setQuestion("");
      setLoading(true);
      setError(null);
      setResponse(null);
  
      try {
  
        const result =
          await askQuestion(
            question.trim()
          );
  
        setResponse(result);
  
      } catch (error) {
  
        setError(
          error instanceof Error
            ? error.message
            : "Something went wrong"
        );
  
      } finally {
  
        setLoading(false);
      }
    }
  
    return (
      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto",
          padding: "20px"
        }}
      >
  
        <h2>
          Enterprise AI Knowledge Assistant
        </h2>
  
        <form
          onSubmit={handleSubmit}
        >
  
          <textarea
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="Ask a question about your documents..."
            rows={5}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "12px"
            }}
          />
  
          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Thinking..."
              : "Ask"}
          </button>
  
        </form>
  
        {error && (
          <div
            style={{
              marginTop: "20px"
            }}
          >
            <strong>Error:</strong> {error}
          </div>
        )}
  
        {response && (
          <div
            style={{
              marginTop: "30px"
            }}
          >
  
            <h3>
              Answer
            </h3>
  
            <p>
              {response.answer}
            </p>
  
            <h3>
              Sources
            </h3>
  
            {response.sources.map(
              (source) => (
  
                <div
                  key={source.chunkId}
                  style={{
                    marginBottom: "12px"
                  }}
                >
  
                  <strong>
                    {source.fileName ||
                      source.documentId}
                  </strong>
  
                  {source.pageNumber && (
                    <span>
                      {" "}
                      — Page {source.pageNumber}
                    </span>
                  )}
  
                  <div>
                    Similarity:{" "}
                    {source.similarity.toFixed(3)}
                  </div>
  
                </div>
  
              )
            )}
  
          </div>
        )}
  
      </div>
    );
  }

// export default function Chat() { 
//   const [question, setQuestion] = useState(""); 
//   const [response, setResponse] = useState<ChatResponse | null>(null); 
//   const [loading, setLoading] = useState(false); 
//   const [error, setError] = useState<string | null>(null); 

//   // ✅ FIXED: Typed the form event explicitly to eliminate the ts(6385) deprecation warning
//   async function handleSubmit(event: React.FormEvent<HTMLFormElement>) { 
//     event.preventDefault(); 
//     if (!question.trim()) { 
//       return; 
//     } 
//     setLoading(true); 
//     setError(null); 
//     setResponse(null); 
//     try { 
//       const result = await askQuestion(question.trim()); 
//       setResponse(result); 
//     } catch (err) { 
//       setError(err instanceof Error ? err.message : "Something went wrong"); 
//     } finally { 
//       setLoading(false); 
//     } 
//   } 

//   return ( 
//     <div style={styles.container}> 
//       <h2 style={styles.title}>Enterprise AI Knowledge Assistant</h2> 
      
//       <form onSubmit={handleSubmit} style={styles.form}> 
//         <textarea 
//           value={question} 
//           onChange={(event) => setQuestion(event.target.value)} 
//           placeholder="Ask a question about your documents..." 
//           rows={4} 
//           style={styles.textarea} 
//         /> 
//         <button type="submit" disabled={loading} style={loading ? styles.buttonDisabled : styles.button}> 
//           {loading ? "Thinking..." : "Ask Question"} 
//         </button> 
//       </form> 

//       {error && ( 
//         <div style={styles.errorBox}> 
//           <strong>Error:</strong> {error} 
//         </div> 
//       )} 

//       {response && ( 
//         <div style={styles.resultsContainer}> 
//           <div style={styles.answerSection}> 
//             <h3 style={styles.sectionHeading}>Answer</h3> 
//             <p style={styles.answerText}>{response.answer}</p> 
//           </div> 

//           <div style={styles.sourcesSection}> 
//             <h3 style={styles.sectionHeading}>Sources Used</h3> 
//             <div style={styles.sourceGrid}> 
//               {response.sources.map((source) => ( 
//                 <div key={source.chunkId} style={styles.sourceCard}> 
//                   <div style={styles.sourceHeader}> 
//                     <span style={styles.sourceName}>{source.fileName || source.documentId}</span> 
//                     {source.pageNumber && ( 
//                       <span style={styles.pageBadge}>Page {source.pageNumber}</span> 
//                     )} 
//                   </div> 
//                   <div style={styles.sourceMeta}> 
//                     Match Score: {(source.similarity * 100).toFixed(1)}% 
//                   </div> 
//                 </div> 
//               ))} 
//             </div> 
//           </div> 
//         </div> 
//       )} 
//     </div> 
//   ); 
// }

// // 💅 Modernized Enterprise UI CSS-in-JS layout styles
// const styles = {
//   container: {
//     maxWidth: "850px",
//     margin: "40px auto",
//     padding: "32px",
//     fontFamily: "system-ui, -apple-system, sans-serif",
//     backgroundColor: "#ffffff",
//     borderRadius: "12px",
//     boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
//   },
//   title: {
//     fontSize: "24px",
//     fontWeight: 700,
//     color: "#1e293b",
//     marginBottom: "24px",
//   },
//   form: {
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: "16px",
//   },
//   textarea: {
//     width: "100%",
//     padding: "16px",
//     borderRadius: "8px",
//     border: "1px solid #cbd5e1",
//     fontSize: "15px",
//     lineHeight: "1.5",
//     color: "#334155",
//     resize: "vertical" as const,
//     outline: "none",
//     boxSizing: "border-box" as const,
//     transition: "border-color 0.2s",
//   },
//   button: {
//     alignSelf: "flex-end",
//     backgroundColor: "#2563eb",
//     color: "#ffffff",
//     padding: "12px 24px",
//     borderRadius: "6px",
//     border: "none",
//     fontSize: "15px",
//     fontWeight: 600,
//     cursor: "pointer",
//     transition: "background-color 0.2s",
//   },
//   buttonDisabled: {
//     alignSelf: "flex-end",
//     backgroundColor: "#93c5fd",
//     color: "#ffffff",
//     padding: "12px 24px",
//     borderRadius: "6px",
//     border: "none",
//     fontSize: "15px",
//     fontWeight: 600,
//     cursor: "not-allowed",
//   },
//   errorBox: {
//     marginTop: "24px",
//     padding: "16px",
//     backgroundColor: "#fef2f2",
//     borderLeft: "4px solid #ef4444",
//     borderRadius: "6px",
//     color: "#991b1b",
//     fontSize: "14px",
//   },
//   resultsContainer: {
//     marginTop: "32px",
//     borderTop: "1px solid #e2e8f0",
//     paddingTop: "32px",
//     display: "flex",
//     flexDirection: "column" as const,
//     gap: "24px",
//   },
//   answerSection: {
//     backgroundColor: "#f8fafc",
//     padding: "20px",
//     borderRadius: "8px",
//     border: "1px solid #f1f5f9",
//   },
//   sectionHeading: {
//     fontSize: "16px",
//     fontWeight: 600,
//     color: "#475569",
//     margin: "0 0 12px 0",
//     textTransform: "uppercase" as const,
//     letterSpacing: "0.05em",
//   },
//   answerText: {
//     fontSize: "16px",
//     lineHeight: "1.6",
//     color: "#1e293b",
//     margin: 0,
//   },
//   sourcesSection: {},
//   sourceGrid: {
//     display: "grid",
//     gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
//     gap: "12px",
//     marginTop: "12px",
//   },
//   sourceCard: {
//     padding: "14px",
//     border: "1px solid #e2e8f0",
//     borderRadius: "6px",
//     backgroundColor: "#ffffff",
//   },
//   sourceHeader: {
//     display: "flex",
//     justifyContent: "space-between",
//     alignItems: "center",
//     gap: "8px",
//     marginBottom: "8px",
//   },
//   sourceName: {
//     fontSize: "14px",
//     fontWeight: 600,
//     color: "#334155",
//     whiteSpace: "nowrap" as const,
//     overflow: "hidden",
//     textOverflow: "ellipsis",
//   },
//   pageBadge: {
//     fontSize: "11px",
//     backgroundColor: "#e2e8f0",
//     color: "#475569",
//     padding: "2px 6px",
//     borderRadius: "4px",
//     fontWeight: 500,
//     flexShrink: 0,
//   },
//   sourceMeta: {
//     fontSize: "12px",
//     color: "#64748b",
//   },
// };