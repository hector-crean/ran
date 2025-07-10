

interface HollowButtonProps {
    children: React.ReactNode;
}

const HollowButton = ({ children }: HollowButtonProps) => {

    return (
        <div className="px-32 py-8">
            <div
                className="flex items-center justify-center"
                style={{
                    boxShadow: '0 0 0 5px rgba(206, 209, 222, 1.0)',
                    padding: '5px',
                    borderRadius: '18px'
                }}
            >
                {/* Inner container */}
                <div
                    className="flex items-center justify-center py-4 px-12"
                    style={{
                        backgroundColor: 'rgb(206, 209, 222)',
                        borderRadius: '14px'

                    }}
                >
                    <div
                        className={`relative flex items-center w-full h-full`}
                        style={{

                            backgroundColor: 'rgb(206, 209, 222)'
                        }}
                    >
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export { HollowButton };
