"use client";
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import useSWR from "swr";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);

function convertTargetData(data: any) {
  const rows = Object.keys(data.organism).map((key) => ({
    organism: data.organism[key],
    pref_name: data.pref_name[key],
    target_chembl_id: data.target_chembl_id[key],
  }));
  return rows;
}

function convertDrugsData(drugsData: any) {
  if (drugsData == null) {
    return [];
  }
  let { Phase ,S_method, SMILES_data, Molecule_ID, Score } = drugsData;
  let result = [];

  // Iterate over the SMILES_ID keys since we're using it as the base
  for (const key in SMILES_data) {
    // Ensure the key exists in the other properties before adding to the result
    if (
      SMILES_data.hasOwnProperty(key) &&
      Molecule_ID.hasOwnProperty(key) &&
      S_method.hasOwnProperty(key) &&
      Phase.hasOwnProperty(key) &&
      Score.hasOwnProperty(key)
    ) {
      // Create an object for each entry with all data
      let drugObj = {
        id: key,
        SMILES: SMILES_data[key],
        moleculeId: Molecule_ID[key],
        score: Score[key],
        S_method: S_method[key],
        Phase: Phase[key],
      };
      result.push(drugObj);
    }
  }

  return result;
}

function convertPdbData(data: any) {
  if (!data.pdb_id) {
    return [];
  }
  const rows = Object.keys(data.pdb_id).map((key) => ({
    pdb_id: data.pdb_id[key],
    method: data.method[key],
    resolution: data.resolution[key],
    length: data.length[key],
    num_chains: data.num_chains[key],
  }));
  return rows;
}

export default function Home() {
  const [target, setTarget] = useState("");
  const [starget, setStarget] = useState("");
  const [targetInput, setTargetinput] = useState("");
  const [targetlast, setTargetlast] = useState("");
  const [pdb, setPdb] = useState("");
  const [spdb, setSpdb] = useState("");
  const [smileInput, setSmileInput] = useState("");
  const [smilelast, setSmilelast] = useState("");

  interface RowTargetData {
    organism: string;
    pref_name: string;
    target_chembl_id: string;
  }

  interface RowPdbData {
    pdb_id: string;
    method: string;
    resolution: string;
    length: string;
    num_chains: string;
  }

  interface RowDrugsData {
    id: string;
    SMILES: string;
    moleculeId: string;
    score: string;
    S_method: string
    Phase: string
  }

  const {
    data: targetData,
    error: targetError,
    isLoading: targetLoading,
  } = useSWR(!smilelast ? starget && `/api/target/${starget}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });
  const [rowTargetData, setRowTargetData] = useState<RowTargetData[]>([]);
  console.log(targetData);
  useEffect(() => {
    if (targetData) {
      const rows = convertTargetData(targetData);
      setRowTargetData(rows);
    }
  }, [targetData]);

  const {
    data: pdbsData,
    error: pdbsError,
    isLoading: pdbsLoading,
  } = useSWR(
    !smilelast ? targetlast && `/api/${starget}/pdb/${targetlast}` : null,
    fetcher,
    {
      revalidateIfStale: false,
    },
  );

  const [rowPdbData, setRowPdbData] = useState<RowPdbData[]>([]);

  const {
    data: pdbData,
    isLoading: pdbLoading,
  } = useSWR(!smilelast ? spdb && `/api/pdb/${spdb}` : null, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  });

  const [drugs, setDrugs] = useState(null);
  const [jobId, setJobId] = useState(null);

  useEffect(() => {
    if (smilelast) {
      // Trigger the processing
      axios
        .get(`/api/smiles/${smilelast}`)
        .then((response) => {
          setJobId(response.data.job_id);
        })
        .catch((error) => {
          console.error("Error triggering processing:", error);
        });
    }
  }, [smilelast]);

  useEffect(() => {
    if (jobId) {
      // Poll the server for the result
      const intervalId = setInterval(() => {
        axios
          .get(`/api/results/${jobId}`)
          .then((response) => {
            if (response.status === 200) {
              clearInterval(intervalId); // Stop polling once a result is received
              setDrugs(response.data);
            }
          })
          .catch((error) => {
            clearInterval(intervalId); // Stop polling on error
            console.error("Error fetching result:", error);
          });
      }, 5000); // Poll every 5 seconds

      return () => clearInterval(intervalId); // Clear the interval when the component is unmounted
    }
  }, [jobId]);

  const [rowDrugs, setRowdrugs] = useState<RowDrugsData[]>([]);

  useEffect(() => {
    if (drugs) {
      let drugrows = convertDrugsData(drugs);

      // Sort by score if necessary (after converting string score to float)
      drugrows.sort((a, b) => parseFloat(b.score) - parseFloat(a.score)); // Assuming higher score is better

      setRowdrugs(drugrows);
    }
  }, [drugs]);

  useEffect(() => {
    if (pdbsData) {
      let pdbrows = convertPdbData(pdbsData);

      pdbrows.sort((a, b) => {
        const resolutionA = parseFloat(a.resolution);
        const resolutionB = parseFloat(b.resolution);
        const lengthA = parseFloat(a.length);
        const lengthB = parseFloat(b.length);

        if (isNaN(resolutionA)) return 1;
        if (isNaN(resolutionB)) return -1;
        if (lengthA > lengthB) return -1;
        if (lengthA < lengthB) return 1;

        if (resolutionA < resolutionB) return -1;
        if (resolutionA > resolutionB) return 1;

        return 0;
      });

      setRowPdbData(pdbrows);
    }
  }, [pdbsData]);

  console.log(convertDrugsData(drugs));
  let targetcontent;
  targetLoading ? (targetcontent = <div>Loading...</div>) : null;
  targetError
    ? (targetcontent = <div>Error: {targetError.message}</div>)
    : null;

  let pdbcontent;
  pdbsLoading ? (pdbcontent = <div>Loading...</div>) : null;
  pdbsError ? (pdbcontent = <div>Error: {pdbsError.message}</div>) : null;
  console.log(drugs);
  console.log(rowDrugs);
  return (
    <main className="flex h-3/4 max-w-screen flex-col items-center font-serif">
      <Tabs
        defaultValue="etarget"
        className=" p-10 flex flex-col overflow-x-visible"
      >
        <TabsList className=" font-extralight border-black">
          <ScrollArea className="border-black">
            <TabsTrigger value="etarget">Enter Target</TabsTrigger>
            <TabsTrigger value="ctarget">choose one</TabsTrigger>
            <TabsTrigger value="cpdb">Choose pdb</TabsTrigger>
            <TabsTrigger value="ligands">Select ligands</TabsTrigger>
            <TabsTrigger value="drugs">result</TabsTrigger>
          </ScrollArea>
        </TabsList>
        <TabsContent value="etarget">
          <div className="mt-4 flex flex-col">
            <p className="text-center">Enter target name </p>
            <Input
              className="w-25 border-slate-950"
              placeholder="Enter target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
            <Button
              className="flex-none"
              size={"sm"}
              onClick={() => setStarget(target)}
            >
              submit
            </Button>
          </div>
        </TabsContent>
        <TabsContent
          className=" flex flex-col itmes-center mt-4"
          value="ctarget"
        >
          {starget ? (
            targetcontent ? (
              targetcontent
            ) : (
              <Table className="">
                <TableCaption>Enter the desired target id</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead className="">Organism</TableHead>
                    <TableHead>Preferred Name</TableHead>
                    <TableHead>Target ChEMBL ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rowTargetData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index}</TableCell>
                      <TableCell>{row.organism}</TableCell>
                      <TableCell className="w-5">{row.pref_name}</TableCell>
                      <TableCell>{row.target_chembl_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            <div className="flex flex-col items-center border-black">
              first fill the pervious tab
            </div>
          )}

          <div
            id="inputTarger"
            className="flex flex-col itmes-center justify-center space-y-2"
          >
            <Input
              className="flex itmes-center"
              onChange={(e) => setTargetinput(e.target.value)}
            />
            <Button size={"sm"} onClick={() => setTargetlast(targetInput)}>
              submit
            </Button>
          </div>
        </TabsContent>
        <TabsContent className="flex flex-col items-center mt-4" value="cpdb">
          {targetlast ? (
            pdbcontent ? (
              pdbcontent
            ) : (
              <Table>
                <TableCaption>Enter the desired pdb id</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>pdb id</TableHead>
                    <TableHead>method</TableHead>
                    <TableHead>resolution</TableHead>
                    <TableHead>length</TableHead>
                    <TableHead>chanin numbers</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rowPdbData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index}</TableCell>
                      <TableCell className="font-medium">
                        {row.pdb_id}
                      </TableCell>
                      <TableCell>{row.method}</TableCell>
                      <TableCell>{row.resolution}</TableCell>
                      <TableCell>{row.length}</TableCell>
                      <TableCell>{row.num_chains}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )
          ) : (
            <div className="flex items-center">Enter pdb id</div>
          )}
          <section className="flex flex-col border-black">
            <Input onChange={(e) => setPdb(e.target.value)}></Input>
            <Button onClick={() => setSpdb(pdb)}>submit</Button>
          </section>
        </TabsContent>
        <TabsContent value="ligands">
          <section>
            {pdbLoading ? (
              <div className="flex items-center">Loading...</div>
            ) : (
              <div className=" flex flex-col items-center">
                {pdbData &&
                  Object?.keys(pdbData).map((key) => (
                    <div className="flex flex-wrap" key={key}>
                      <strong className="font-mono">{key}: &nbsp; </strong>{" "}
                      <h1 className=" text-black">{pdbData[key]}</h1>
                    </div>
                  ))}
              </div>
            )}

            <div className="mt-6 flex flex-col items-center space-y-2">
              <p> Enter the smiles </p>
              <Input
                className="border-black"
                onChange={(e) => setSmileInput(e.target.value)}
              ></Input>
              <Button onClick={() => setSmilelast(smileInput)}>Submit</Button>
            </div>
          </section>
        </TabsContent>
        <TabsContent value="drugs">
          <div className="mt-4 flex flex-col items-center">
            {smilelast ? (
              !drugs ? (
                <div>
                  Loading... <br></br> This might take upto 20 mins
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>id</TableHead>
                      <TableHead>smiles</TableHead>
                      <TableHead>score</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rowDrugs.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.S_method}</TableCell>
                        <TableCell>{row.Phase}</TableCell>          
                        <TableCell>{row.SMILES}</TableCell>          
                        <TableCell className="font-bold">{row.score}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )
            ) : (
              "enter smile"
            )}
          </div>
        </TabsContent>
      </Tabs>
    </main>
  );
}
