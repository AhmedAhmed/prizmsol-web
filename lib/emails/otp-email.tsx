// emails/otp-email.tsx
import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Preview,
    Section,
    Text,
} from "@react-email/components";

export function OtpEmail({
    otp,
    name,
}: {
    otp: string;
    name?: string;
}) {
    return (
        <Html>
            <Head />
            <Preview>Your Prizmsol login code: {otp}</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Heading style={heading}>
                        Verify your email to sign in to <strong>Prizmsol</strong>
                    </Heading>
                    <Hr style={hr} />
                    {name && (
                        <Text style={paragraph}>
                            Hello <strong>{name}</strong>,
                        </Text>
                    )}
                    <Text style={paragraph}>
                        To complete the sign-in process; enter the 6-digit code in the original window:
                    </Text>
                    <Section style={codeContainer}>
                        <Text style={code}>{otp}</Text>
                    </Section>
                    <Hr style={hr} />
                    <Text style={footer}>
                        If you didn't request this, you can safely ignore this email.
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}

const main = {
    backgroundColor: "#ffffff",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
    margin: "0 auto",
    padding: "40px 32px",
    maxWidth: "560px",
};

const heading = {
    fontSize: "26px",
    fontWeight: "400",
    color: "#000",
    textAlign: "center" as const,
    margin: "32px 0 24px",
    lineHeight: "1.3",
};

const hr = {
    borderColor: "#e6e6e6",
    margin: "24px 0",
};

const paragraph = {
    fontSize: "15px",
    color: "#000",
    lineHeight: "1.6",
    margin: "0 0 16px",
};

const codeContainer = {
    background: "#f4f4f4",
    borderRadius: "8px",
    padding: "24px",
    textAlign: "center" as const,
    margin: "24px auto",
    width: "fit-content",
    minWidth: "240px",
};

const code = {
    fontSize: "36px",
    fontWeight: "500",
    letterSpacing: "0.3em",
    color: "#000",
    margin: "0",
};

const footer = {
    fontSize: "13px",
    color: "#666",
    margin: "0",
};