import CodeBlockExecutor from './CodeBlockExecutor';

const PageContent = ({ content, isDarkMode = false, onComplete, onNext, onPrev }) => {
    if (!content) {
        return <p style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>No page content available</p>;
    }

    // Combine all blocks with their types and sort by order
    const allBlocks = [];

    if (content.text_blocks) {
        content.text_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'text' });
        });
    }

    if (content.code_blocks) {
        content.code_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'code' });
        });
    }

    if (content.video_blocks) {
        content.video_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'video' });
        });
    }

    if (content.highlight_blocks) {
        content.highlight_blocks.forEach(block => {
            allBlocks.push({ ...block, blockType: 'highlight' });
        });
    }

    // Sort all blocks by order property
    allBlocks.sort((a, b) => (a.order || 0) - (b.order || 0));

    return (
        <>
            {/* Dark mode styles for rich text content */}
            {isDarkMode && (
                <style>{`
                    .page-content .text-block {
                        color: #e0e0e0 !important;
                    }
                    .page-content .text-block h1,
                    .page-content .text-block h2,
                    .page-content .text-block h3,
                    .page-content .text-block h4,
                    .page-content .text-block h5,
                    .page-content .text-block h6 {
                        color: #ffffff !important;
                    }
                    .page-content .text-block p,
                    .page-content .text-block div,
                    .page-content .text-block span,
                    .page-content .text-block li,
                    .page-content .text-block td,
                    .page-content .text-block th {
                        color: #e0e0e0 !important;
                    }
                    .page-content .text-block a {
                        color: #6ec1e4 !important;
                    }
                    .page-content .text-block strong,
                    .page-content .text-block b {
                        color: #ffffff !important;
                    }
                    .page-content .text-block code {
                        background-color: #1e1e1e !important;
                        color: #90ee90 !important;
                        border: 1px solid #444 !important;
                    }
                    .page-content .text-block pre {
                        background-color: #1e1e1e !important;
                        color: #e0e0e0 !important;
                        border: 1px solid #444 !important;
                    }
                    .page-content .text-block table {
                        border-color: #444 !important;
                        background-color: transparent !important;
                    }
                    .page-content .text-block table thead {
                        background-color: #2d2d2d !important;
                    }
                    .page-content .text-block table thead th {
                        color: #ffffff !important;
                        background-color: #2d2d2d !important;
                        border-color: #444 !important;
                    }
                    .page-content .text-block table tbody tr {
                        background-color: transparent !important;
                    }
                    .page-content .text-block table tbody tr:nth-child(even) {
                        background-color: #1a1a1a !important;
                    }
                    .page-content .text-block table tbody tr:hover {
                        background-color: #252525 !important;
                    }
                    .page-content .text-block table td,
                    .page-content .text-block table th {
                        border-color: #444 !important;
                        background-color: transparent !important;
                    }
                    .page-content .text-block blockquote {
                        border-left-color: #6ec1e4 !important;
                        color: #adb5bd !important;
                    }
                    .page-content .video-block h5 {
                        color: #ffffff !important;
                    }
                    .page-content .video-block p {
                        color: #e0e0e0 !important;
                    }
                `}</style>
            )}
            <div className="page-content" style={{ paddingLeft: '20px' }}>
                {allBlocks.length > 0 ? (
                    <div className="content-blocks">
                        {allBlocks.map((block, index) => (
                            <div key={`${block.blockType}-${block.id || index}`} className={`${block.blockType}-block mb-4`}>
                                {block.blockType === 'text' && (
                                    <div dangerouslySetInnerHTML={{ __html: block.content }} />
                                )}

                                {block.blockType === 'code' && (
                                    <CodeBlockExecutor
                                        code={block.code}
                                        language={block.language || 'javascript'}
                                        title={block.title || ''}
                                        description={block.description || ''}
                                        isDarkMode={isDarkMode}
                                    />
                                )}

                                {block.blockType === 'video' && (
                                    <div className="video-block">
                                        {block.title && <h5>{block.title}</h5>}
                                        {block.youtube_embed_id ? (
                                            <div className="ratio ratio-16x9">
                                                <iframe
                                                    src={`https://www.youtube.com/embed/${block.youtube_embed_id}`}
                                                    title={block.title || 'Embedded Video'}
                                                    allowFullScreen
                                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                ></iframe>
                                            </div>
                                        ) : (
                                            <p style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>No video embed available.</p>
                                        )}
                                        {block.description && <p className="mt-2">{block.description}</p>}
                                    </div>
                                )}

                                {block.blockType === 'highlight' && (
                                    <pre style={{
                                        backgroundColor: isDarkMode ? '#1a1a1a' : '#000000',
                                        color: '#FFFFFF',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        borderLeft: '4px solid #FF8306',
                                        margin: '15px 0',
                                        fontFamily: 'monospace',
                                        fontSize: '14px',
                                        lineHeight: '1.6',
                                        whiteSpace: 'pre',
                                        overflowX: 'auto',
                                        overflowY: 'auto'
                                    }}>{block.content}</pre>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: isDarkMode ? '#adb5bd' : '#6c757d' }}>No content blocks available.</p>
                )}
            </div>
        </>
    );
};

export default PageContent;