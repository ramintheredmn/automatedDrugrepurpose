'use client'
import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import axios from 'axios'
import useSWR from 'swr'

import {
  Table,
  
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; 

const fetcher = (url: string) => axios.get(url).then(res => res.data)

function convertTargetData(data: any) {
  const rows = Object.keys(data.organism).map(key => ({
    organism: data.organism[key],
    pref_name: data.pref_name[key],
    target_chembl_id: data.target_chembl_id[key],
  }));
  return rows;
}

function convertPdbData(data: any) {
  if (!data.pdb_id) {
    return [];
  }
  const rows = Object.keys(data.pdb_id).map(key => ({
    pdb_id: data.pdb_id[key],
    method: data.method[key],
    resolution: data.resolution[key],
    length: data.length[key],
    num_chains: data.num_chains[key]
  }));
  return rows;
}
export default function Home() {
const [target, setTarget] = useState("")
const [starget, setStarget] = useState("")
const [data, setData] = useState("")
const [targetInput, setTargetinput] = useState("")
const [targetlast, setTargetlast] = useState("")
const [pdb, setPdb] = useState("")
const [spdb, setSpdb] = useState("")
console.log(target)
console.log(starget)


interface RowTargetData {
  organism: string;
  pref_name: string;
  target_chembl_id: string;
}

interface RowPdbData {
  pdb_id: string,
  method: string,
  resolution: string,
  length: string,
  num_chains: string
}


const {data: targetData, error: targetError, isLoading: targetLoading} = useSWR(starget&&`/api/target/${starget}`, fetcher)
const [rowTargetData, setRowTargetData] = useState<RowTargetData[]>([]);
console.log(targetData)
  useEffect(() => {
    if (targetData) {
      const rows = convertTargetData(targetData);
      setRowTargetData(rows);
    }
  }, [targetData]);

const {data: pdbsData, error: pdbsError, isLoading: pdbsLoading} = useSWR(targetlast&& `/api/${starget}/pdb/${targetlast}`, fetcher)
console.log(pdbsData)
const [rowPdbData, setRowPdbData] = useState<RowPdbData[]>([]);
console.log(rowPdbData)



const{data: pdbData, error: pdbError, isLoading: pdbLoading} = useSWR(spdb &&  `/api/pdb/${spdb}`, fetcher)
console.log(pdbData)

useEffect(() => {
  if (pdbsData) {
    let pdbrows = convertPdbData(pdbsData);

    // Sort by lowest resolution and then by highest length if resolutions are equal,
    // placing rows with NaN values at the end
    pdbrows.sort((a, b) => {
      // Parse resolution and length as floats for accurate comparison
      const resolutionA = parseFloat(a.resolution);
      const resolutionB = parseFloat(b.resolution);
      const lengthA = parseFloat(a.length);
      const lengthB = parseFloat(b.length);

      // Check for NaN values and sort accordingly
      if (isNaN(resolutionA)) return 1;  // Place a at the end if its resolution is NaN
      if (isNaN(resolutionB)) return -1;  // Place b at the end if its resolution is NaN
      if (lengthA > lengthB) return -1;
      if (lengthA < lengthB) return 1;

      if (resolutionA < resolutionB) return -1;
      if (resolutionA > resolutionB) return 1;



      return 0; 
    });

    setRowPdbData(pdbrows);
  }
}, [pdbsData]);



let targetcontent;
targetLoading?  targetcontent = <div>Loading...</div> : null
targetError? targetcontent =  <div>Error: {targetError.message}</div> : null

let pdbcontent;
pdbsLoading?  pdbcontent = <div>Loading...</div> : null
pdbsError? pdbcontent =  <div>Error: {pdbsError.message}</div> : null

  return (
    <main className="flex min-h-screen flex-col items-center  p-24">
        <Tabs defaultValue="etarget" className="flex flex-col w-3/4">
          <TabsList>
            <TabsTrigger value="etarget">Enter Target</TabsTrigger>
            <TabsTrigger value="ctarget">choose one</TabsTrigger>
            <TabsTrigger value="cpdb">Choose pdb</TabsTrigger>
            <TabsTrigger value="ligands">Select ligands</TabsTrigger>
          </TabsList>
          <TabsContent value="etarget">
            <div className='flex flex-col items-center space-y-3 mt-3'>
            <h1>Enter the desired target name </h1>
            <Input className='w-25 border-slate-950' placeholder='Enter target' value={target} onChange={(e)=> setTarget(e.target.value)}/>
            <Button className="flex-none" size={'sm'}
            onClick={()=> setStarget(target)}
            >submit</Button>
            </div>
          
          
          </TabsContent>
          <TabsContent value="ctarget">


            {starget? 

            targetcontent?
            targetcontent
            :
            <Table>
            <TableCaption>Enter the desired target id</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead className="w-[200px]">Organism</TableHead>
                <TableHead>Preferred Name</TableHead>
                <TableHead>Target ChEMBL ID</TableHead>
              </TableRow>
            </TableHeader>
                <TableBody>
                  {rowTargetData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{index}</TableCell>
                      <TableCell className="font-medium">{row.organism}</TableCell>
                      <TableCell>{row.pref_name}</TableCell>
                      <TableCell>{row.target_chembl_id}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
          </Table>

          : 
          <div className="flex items-center">Enter target name</div>
          
          }

          <div id="inputTarger" className="flex flex-col itmes-center justify-center space-y-2">

            <Input className="flex itmes-center" onChange={(e)=> setTargetinput(e.target.value)}/>
            <Button size={'sm'}
              onClick={()=>setTargetlast(targetInput)}
              >submit</Button>
          </div>


          </TabsContent>
          <TabsContent value="cpdb">

          {targetlast ?

            pdbcontent ?
              pdbcontent
              :
              <Table>
                <TableCaption>Enter the desired pdb id</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead className="w-[200px]">pdb id</TableHead>
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
                      <TableCell className="font-medium">{row.pdb_id}</TableCell>
                      <TableCell>{row.method}</TableCell>
                      <TableCell>{row.resolution}</TableCell>
                      <TableCell>{row.length}</TableCell>
                      <TableCell>{row.num_chains}</TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>

            :
            <div className="flex items-center">Enter pdb id</div>

          }
          <section className='flex flex-col border-black'>

            <Input onChange={(e)=> setPdb(e.target.value)}></Input>
            <Button onClick={()=> setSpdb(pdb)}>submit</Button>
          </section>

          </TabsContent>
        </Tabs>

    </main>
  )
}
