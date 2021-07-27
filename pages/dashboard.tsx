import {useAuth} from "../contexts/AuthContext";
import {withSSRAuth} from "../utils/withSSRAuth";
import {setupAPIClient} from "../services/api";
import {Can} from "../components/Can";

export default function Dashboard () {
  const {user, signOut} = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      <button onClick={signOut}>Sign out</button>
      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx);
  const response = await apiClient.get('/me');
  console.log(response.data);

  return {
    props: {},
  }
});
