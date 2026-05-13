import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

// select mode of prompt input
export default function PromptMode({
    onSelect
}: {
    onSelect: (mode: string) => void;
}) {
    return (
        <Select defaultValue={"tts"} onValueChange={onSelect}>
            <SelectTrigger className="w-fit rounded-full">
                <SelectValue placeholder="Select a mode" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="tts">Text to Speech</SelectItem>
                <SelectItem value="translate">Translate</SelectItem>
                <SelectItem value="sound-effects">Sound Effects</SelectItem>
                <SelectItem value="help">Ask Anything</SelectItem>
            </SelectContent>
        </Select>
    );
}