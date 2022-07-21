import styles from "../../../layouts/main/MainLayout.module.scss";

type MeDetailsProps = {
  name: string;
  value: string | number;
  full?: boolean;
};

const MeDetails = (props: MeDetailsProps) => {
  return (
    <>
      <div className={[styles.MeDetails__Name, props.full && styles.Full].filter(c => !!c).join(' ')}>{props.name}:</div>
      <div className={[styles.MeDetails__Value, props.full && styles.Full].filter(c => !!c).join(' ')}>{props.value}</div>
    </>
  );
};

export default MeDetails;
