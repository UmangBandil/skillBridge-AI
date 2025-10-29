import { EditableField } from "../EditableField/EditableField";

interface PortfolioInfoProps {
    name: string;
    setName: (name: string) => void;
    address: string;
    setAddress: (address: string) => void;
    skills: string;
    setSkills: (skills: string) => void;
    hobbies: string;
    setHobbies: (hobbies: string) => void;
}

export const PortfolioInfo = ({
    name, setName, address, setAddress, skills, setSkills, hobbies, setHobbies
}: PortfolioInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {name === "Your Name" && (
        <div className="p-6 border rounded-md">
          <EditableField label="Name" initialValue={name} onSave={setName} />
        </div>
      )}
      {address === "Your Address" && (
        <div className="p-6 border rounded-md">
          <EditableField label="Address" initialValue={address} onSave={setAddress} />
        </div>
      )}
      {skills === "Your Skills" && (
        <div className="p-6 border rounded-md">
          <EditableField label="Skills" initialValue={skills} onSave={setSkills} />
        </div>
      )}
      {hobbies === "Your Hobbies" && (
        <div className="p-6 border rounded-md">
          <EditableField label="Hobbies" initialValue={hobbies} onSave={setHobbies} />
        </div>
      )}
    </div>
  );
};
