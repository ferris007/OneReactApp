import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";
import Clipboard from '@react-native-clipboard/clipboard';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { MaterialCommunityIcons, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../lib/queryClient";
import { type VIIFTBalance, type CompletedGoal, type VIIFTTransaction } from "../../shared/schema";
import { WalletConnection } from "./WalletConnection";
import { ClaimRewards } from "./ClaimRewards";
import { useToast } from "../../hooks/use-toast";
import * as WebBrowser from 'expo-web-browser';
import { getVerifyTrustLine, useClaimTokens, useConenctXRPWallet, useGetCompletedGoals, useGetRewards, useGetTransactions, useGetTrustedDevices, useGetTrustInstructions, useGetWeightClaims, useSubmitWeightProof } from "../../app/api-calls/Rewards/rewards";
import Toast from "react-native-toast-message";
import { Input } from "../ui/Input";
import { useFocusEffect } from "expo-router";
import { useBodyMetrics } from "../../src/hooks/useBodyMetrics";
import { connectAndGetWeights } from "../../src/metrics/ios/healthReward";

interface RewardDashboardProps {
  userId: string;
}

export function RewardDashboard({ userId }: RewardDashboardProps) {
  const { toast } = useToast();
  const [showWalletConnection, setShowWalletConnection] = useState(false);
  const [editWallet, setEditWallet] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimAvailable, setClaimAvailable] = useState(false);
  const [weightsList, setWeightsList] = useState<any>(null);
  const [errors, seErrors] = useState<string[]>([]);
  const [walletAddress, setWalletAddress] = useState<string>("")
  const [weightSubmissionErrors, setWeightSubmissionerrors] = useState<any>(null)

  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useGetRewards()


  const { data: completedGoals, isLoading: goalsLoading, refetch: refetchCompGoals } = useGetCompletedGoals()
  const { data: transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useGetTransactions()

  const { data: trustLineData, isLoading: verifyPending, refetch: refetchTrustLine, error: trustLineError } = getVerifyTrustLine(balance?.xrpWalletAddress ? balance?.xrpWalletAddress : "")
  const { data: trustInstructions, refetch: refetchInstructions } = useGetTrustInstructions()

  const { mutate: connectXrpWallet, isPending: walletConnectionPending } = useConenctXRPWallet()

  const { data: weightClaims, isLoading: loadingWeightClaims, refetch: refetchWeightClaims } = useGetWeightClaims()
  const { data: trustedDevices, isLoading: loadingTrustedDevices } = useGetTrustedDevices()
  const { mutate: weightProofMutate, isPending: isPendingWeightProof } = useSubmitWeightProof()
  const { mutate: claimTokensMutate, isPending: isPendingClainTokens } = useClaimTokens()



  console.log("weightsListweightsList", balance, trustLineData)
  console.log("trustLineError", trustLineError?.response?.data?.detail)


  useFocusEffect(useCallback(() => {
    refetchBalance()
    refetchCompGoals()
    refetchTrustLine()
    refetchInstructions()
    refetchTransactions()
    // if (trustLineError)
    //   Toast.show({
    //     type: "error", text1: "Error", text2: "Wallet " + trustLineError?.response?.data?.detail || trustLineError?.detail || "Enable to fetch wallet info"
    //   })
  }, [balance]))



  const handleWalletConnected = (wallet: string | null = null) => {
    setShowWalletConnection(false);

    let payload = {
      walletAddress: wallet !== null ? wallet : walletAddress
    }
    console.log("PAYLOADD", payload);

    connectXrpWallet(payload, {
      onSuccess: (res) => {
        console.log("RESSS", res);
        refetchBalance()
        Toast.show({
          type: "success",
          text2: "Your XRP wallet has been connected successfully!",
          text1: 'Wallet Connected',
        });
      }, onError: (err) => {
        console.log("ERRRO(R", err);
        Toast.show({
          type: "error",
          text2: "Error",
          text1: 'Wallet not connected',
        });

      }
    })





  };

  const handleRewardsClaimed = () => {
    setShowClaimModal(false);
    let payload = {
      amount: balance?.pendingBalance
    }




    claimTokensMutate(payload, {
      onSuccess: (res) => {
        console.log("RESSS", res);
        if (!res?.success) {
          Toast.show({
            type: 'error',
            text1: "Error",
            text2: res?.error || "Something went wrong.Transaction failed"
          })
        } else {
          Toast.show({
            type: 'success',
            text1: "Success",
            text2: "Your VII  tokens have been sent to your wallet!"
          })
        }


      }, onError: (err) => {
        console.log("ERRR", err);
        Toast.show({
          type: 'error',
          text1: "Error",
          text2: err?.message || "Something went wrong.Transaction failed"
        })

      }
    })
    // refetchBalance();
    // toast({
    //   title: "Rewards Claimed",
    //   description: "Your VII  tokens have been sent to your wallet!",
    //   variant: 'default',
    // });
  };
  useEffect(() => {
    if (!balance?.trustLineSetup || !trustLineData?.trustLineSetup) {

      refetchInstructions()
      console.log("ENTERED", balance);

    } else {
      refetchBalance()
      refetchTrustLine()
    }
  }, [balance, trustLineData])


  useEffect(() => {
    if (balance?.xrpWalletAddress && balance?.xrpWalletAddress !== "") {
      refetchTrustLine()
    }
  }, [balance])



  console.log("TRUST LINE DTA", trustLineData);



  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (weightClaims?.length > 0) {

      const hasClaimThisMonth = weightClaims.some(claim => {
        const claimDate = new Date(claim.submittedAt);
        return claimDate.getMonth() === currentMonth &&
          claimDate.getFullYear() === currentYear;
      });
      if (hasClaimThisMonth) {
        setClaimAvailable(false);
      } else {
        setClaimAvailable(true);
      }
    }
  }, [weightClaims])



  const getWeightMeasurements = async () => {
    const weights: any = await connectAndGetWeights(trustedDevices ? trustedDevices?.bundleIds : []);



    if (weights?.errors) {
      seErrors(weights?.errors)
      setWeightsList(null)
    } else {
      console.log("JELLLLO", weights);

      setWeightsList(weights)
      seErrors([])
    }
    console.log("Latest weight (kg):", weights);
  }


  type WeightEntry = {
    endDate: string;
    id: string;
    sourceId: string;
    sourceName: string;
    startDate: string;
    value: number; // in grams
  };

  type MonthlySample = {
    date: string;
    kg: number;
    sourceBundle: string;
    device: string | null;
    wasUserEntered: boolean;
  };

  type WeightProof = {
    startDate: string | undefined;
    endDate: string | undefined;
    startKg: number | undefined;
    endKg: number | undefined;
    startSourceBundle: string | null;
    endSourceBundle: string | null;
    startDevice: string | null;
    endDevice: string | null;
    lossLbs: number | undefined;
    daysBetween: number | undefined;
  };

  type Payload = {
    weightProof: WeightProof;
    userEnteredFlags: boolean[];
    monthlySamples: MonthlySample[];
  };

  function formatToUTC(dateString: string): string {
    return new Date(dateString).toISOString();
  }

  const handleWightProofs = () => {
    if (weightsList === null) {
      return null;
    }

    function getDaysDifference(startDateStr: string, endDateStr: string): number {
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }

    const monthlySamples: MonthlySample[] = weightsList?.monthlySamples.map((item) => ({
      date: formatToUTC(item.endDate), // ✅ UTC format
      kg: item.value / 1000,
      sourceBundle: item.sourceId,
      device: null,
      wasUserEntered: false,
    }));

    const first = weightsList?.monthlySamples[0];
    const last = weightsList?.monthlySamples[weightsList?.monthlySamples?.length - 1];

    const payload: Payload =
    {

      weightProof: {
        startDate: formatToUTC(last.endDate),
        endDate: formatToUTC(first.endDate),
        startKg: last.value / 1000,
        endKg: first.value / 1000,
        startSourceBundle: last.sourceId ?? null,
        endSourceBundle: first.sourceId ?? null,
        startDevice: null,
        endDevice: null,
        lossLbs: (last.value / 1000 - first.value / 1000) * 2.20462,
        daysBetween: getDaysDifference(last.endDate, first.endDate),
      },
      userEnteredFlags: new Array(weightsList?.monthlySamples?.length).fill(false),
      monthlySamples,
    };

    console.log("PAYLOAD", payload);
    weightProofMutate(payload, {
      onSuccess: (res) => {
        console.log("RESSS", res);
        if (res?.data?.errors?.length > 0 || res?.data?.warnings?.length > 0) {
          setWeightSubmissionerrors(res?.data?.errors?.length > 0 ? res?.data?.errors : res?.data?.warnings)
        } else {
          Toast.show({
            type: "success",
            text1: "Success",
            text2: "Weight Proof submitted"
          })
          refetchWeightClaims()
        }

      },
      onError: (err) => {
        console.log("ERRORR", err?.message);

      }
    })
  };


  console.log("WEIGHT CLAINS", weightClaims);



  type WeightSample = {
    id: string;
    sourceName: string;
    sourceId: string;
    startDate: string;
    endDate: string;
    value: number;
  };





  const renderItem = ({ item, index }: { item: WeightSample, index: number }) => {
    console.log("ITEMMM", item);
    let check = (index === 0) || (weightsList?.monthlySamples?.length - 1 === index)

    console.log("CHECKKK", check);

    return (
      check ?
        <>
          <View style={
            [styles.cardWeight, {
              flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4
            }]} >

            <Text style={styles.valueWeight}>{(item.value / 1000).toFixed(1)} kg</Text>
            <Text style={styles.source}>{item.sourceName}</Text>
            <Text style={styles.date}>
              {new Date(item.startDate).toLocaleDateString()}
            </Text>
          </View >
          <Text style={{ marginTop: 12, fontSize: 16, fontWeight: '600' }}>{index === 0 ? "End Weight:" : "Start Weight:"}</Text>
        </>
        : null
    )


  }



  const copyWallet = () => {
    Clipboard.setString(balance?.xrpWalletAddress);
    Toast.show({
      type: "success",
      text1: "Copied",
      text2: "Wallet address copied to clipboard"
    })
  };



  if (balanceLoading || goalsLoading || transactionsLoading || loadingWeightClaims || loadingTrustedDevices) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }


  return (

    <SafeAreaView style={styles.container}>
      <View style={styles.gridContainer}>
        <Card style={styles.card}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle style={[styles.cardTitle, {
              textAlign: 'center'

            }]}>Total Earned</CardTitle>
            <Feather size={16} color="green" />
          </CardHeader>
          <CardContent>
            <Text style={styles.earnedText}>
              {balance?.totalEarned || 0} VII
            </Text>
            <Text style={styles.mutedText}>
              From {completedGoals?.length || 0} completed goals
            </Text>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader style={[styles.cardHeader, {
            paddingVertical: 24,
            paddingHorizontal: 6
          }]}>
            <CardTitle style={[styles.cardTitle, {
              textAlign: 'center'
            }
            ]}>Available to Claim</CardTitle>
          </CardHeader>
          <CardContent>
            <Text style={styles.claimText}>
              {balance?.pendingBalance || 0} VII
            </Text>
            <Text style={styles.mutedText}>
              {balance?.xrpWalletAddress ? 'Ready to claim' : 'Connect wallet to claim'}
            </Text>
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader style={styles.cardHeader}>
            <CardTitle style={[styles.cardTitle, {
              textAlign: 'center'

            }]}>Total Claimed</CardTitle>
            <Feather size={16} color="orange" />
          </CardHeader>
          <CardContent style={{
            paddingHorizontal: 16
          }}>
            <Text style={styles.claimedText}>
              {balance?.totalClaimed || 0} VII
            </Text>
            <Text style={styles.mutedText}>
              Successfully transferred
            </Text>
          </CardContent>
        </Card>
      </View>
      <Card style={styles.walletCard}>

        <CardHeader>
          <CardTitle style={styles.cardTitle}>
            <Feather size={20} color="black" />
            <Text style={{ marginBottom: 4 }}>Requirements</Text>
          </CardTitle>
          <View style={{ marginTop: 8 }}>

            {
              trustedDevices && trustedDevices?.requirements?.length > 0 &&
              trustedDevices?.requirements.map((req: string, index: number) => {
                return (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
                    <Text>{index + 1}. </Text>
                    <Text>{req}</Text>
                  </View>

                )
              })}
          </View>
        </CardHeader>
      </Card>
      <Card style={styles.walletCard}>

        <CardHeader>
          <CardTitle style={styles.cardTitle}>
            <Feather size={20} color="black" />
            <Text style={{ marginBottom: 4 }}>Trusted Apps</Text>
          </CardTitle>
          <View style={{ marginTop: 8 }}>

            {
              trustedDevices && trustedDevices?.trustedApps?.length > 0 &&
              trustedDevices?.trustedApps.map((app: string, index: number) => {
                return (
                  <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', marginTop: 4 }}>
                    <Text>{index + 1}. </Text>
                    <Text>{app}</Text>
                  </View>
                )
              })}
          </View>

        </CardHeader>
      </Card>
      <Card style={styles.walletCard}>

        <CardHeader>
          <CardTitle style={styles.cardTitle}>
            <Feather size={20} color="black" />
            <Text style={{ marginBottom: 4 }}>Rewards Criteria</Text>
          </CardTitle>
          {
            trustedDevices && trustedDevices?.rewards && <View style={{ marginTop: 8 }}>
              {Object.entries(trustedDevices?.rewards).map(
                ([key, value]: [string, any], index: number) => (
                  <View key={index} style={[styles.card, { width: '100%', marginBottom: 8 }]}>
                    <Text style={styles.title}>
                      {index + 1}. {key}
                    </Text>
                    <View style={styles.row}>
                      <Text style={styles.label}>Goal:</Text>
                      <Text style={styles.value}>{value?.minimum}</Text>
                    </View>
                    <View style={styles.row}>
                      <Text style={styles.label}>Reward:</Text>
                      <Text style={styles.value}>{value?.reward}</Text>
                    </View>
                  </View>
                )
              )}
            </View>
          }

        </CardHeader>
      </Card>
      {weightClaims?.length === 0 ?
        null :
        <Card style={styles.walletCard}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>
              Weight Claims
            </CardTitle>


          </CardHeader>


          <>
            {!claimAvailable &&
              <View style={{ paddingHorizontal: 16, marginVertical: 8 }}  >
                <Text style={{ color: 'red', textAlign: 'center' }}>This month's claim has already been made.</Text>
              </View>
            }
            <View style={{ padding: 16, gap: 12 }}  >
              {
                weightClaims && weightClaims?.length > 0 &&
                weightClaims.map((claim: any, index: number) => {
                  return (

                    <View key={index} style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', }}>
                          <Text style={styles.cardTitle}>Goal Achieved: </Text>
                          <Text>{claim?.changeDescription}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.cardTitle}>Earned: </Text>
                          <Text>{claim?.rewardAmount} VII </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        disabled={claim?.status === "completed" || !claimAvailable}
                        style={{ backgroundColor: claim?.status === "completed" || !claimAvailable ? "gray" : '#007BFF', padding: 10, borderRadius: 8 }}>
                        <Text style={[styles.cardTitle, {
                          color: "white"
                        }]}>{claim?.status === "completed" || !claimAvailable ? "Claimed" : "Claim"}</Text>
                      </TouchableOpacity>
                    </View>

                  )
                })
              }
            </View>
          </>
        </Card>

      }


      <Card style={styles.walletCard}>

        <CardHeader>
          <CardTitle style={styles.cardTitle}>
            <CardTitle>Submit Weight Claims</CardTitle>
          </CardTitle>


          <Button
            onPress={getWeightMeasurements}
            style={styles.lefuButton}
          >
            <Text style={[styles.buttonText, {
              color: 'white'
            }]}>
              Get Weight Measurements
            </Text>
          </Button>

          {
            weightsList && weightsList?.monthlySamples?.length > 0 &&
            <FlatList
              data={weightsList?.monthlySamples}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              inverted
            />
          }

          {errors && errors?.length > 0 &&
            <View style={{ marginVertical: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', }}>Errors</Text>
              {errors?.map((item, index) => {
                return (
                  <View key={index} style={{ marginVertical: 4 }}>
                    <Text style={{ fontSize: 14 }}>
                      {index + 1}: {item}
                    </Text>
                  </View>
                )
              })}
            </View>
          }


          {
            weightsList && weightsList?.monthlySamples?.length > 0 &&
            <Button
              disabled={isPendingWeightProof}
              onPress={handleWightProofs}
              style={styles.lefuButton}
            >
              {
                isPendingWeightProof ? <ActivityIndicator
                  size={"small"}
                  color={"white"}
                />
                  :
                  <Text style={[styles.buttonText, {
                    color: 'white'
                  }]}>
                    Submit Weight Claims
                  </Text>
              }
            </Button>
          }





          {weightSubmissionErrors && weightSubmissionErrors?.length > 0 &&
            <View style={{ marginTop: 8 }}>
              <CardTitle>Errors</CardTitle>
              {weightSubmissionErrors?.map((item, index) => {
                return (
                  <Text style={{ marginTop: 4 }}>{index + 1}. {item}</Text>
                )
              })}
            </View>
          }









        </CardHeader>
      </Card>


      <Card style={styles.walletCard}>
        <CardHeader>
          <CardTitle style={styles.cardTitle}>
            <Feather size={20} color="black" />
            <Text>XRP Wallet Connection</Text>
          </CardTitle>
        </CardHeader>
        <CardContent style={styles.walletCardContent}>
          {balance?.xrpWalletAddress ? (
            <>
              <View style={styles.walletConnectedContainer}>
                <View style={styles.walletInfoRow}>
                  <Text style={styles.mutedText}>Connected Wallet:</Text>
                </View>
                <View style={{
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  borderRadius: 8,
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: "#F3F4F6"
                }}>
                  <Text
                    numberOfLines={1}
                    style={[styles.walletAddress, {
                      paddingVertical: 10,
                      flex: 0.9
                    }]}

                  >
                    {balance?.xrpWalletAddress}
                  </Text>
                  <TouchableOpacity hitSlop={
                    {
                      top: 10,
                      bottom: 10,
                      left: 10,
                      right: 10
                    }
                  } onPress={copyWallet}>

                    <FontAwesome5
                      name={"clipboard"}
                      size={16}
                      color="black"
                    />
                  </TouchableOpacity>
                </View>
                <View style={[styles.walletInfoRow, {
                  marginTop: 8
                }]}>
                  <Text style={styles.mutedText}>Trust Line Status:</Text>
                  <Badge variant={balance.trustLineSetup || trustLineData?.trustLineSetup ? "secondary" : "destructive"}>
                    {balance?.trustLineSetup || trustLineData?.trustLineSetup ? "Active" : "Not Set Up"}
                  </Badge>
                </View>
                <View style={styles.buttonGroup}>
                  {(balance.trustLineSetup || trustLineData?.trustLineSetup) && balance.pendingBalance > 0 && (
                    <Button onPress={() => setShowClaimModal(true)} style={styles.claimButton}>
                      <MaterialCommunityIcons size={16} color="white" />
                      <Text style={styles.buttonText}>Claim {balance?.pendingBalance} VII </Text>
                    </Button>
                  )}

                  {/* <Button
                    variant="outline"
                    onPress={() => setShowWalletConnection(true)}
                    style={styles.changeWalletButton}
                  >
                    <Feather size={16} color="black" />
                    <Text style={[styles.buttonText, {
                      color: "#007BFF"
                    }]}>Change Wallet</Text>
                  </Button> */}
                </View>
              </View>

              {(!balance?.trustLineSetup && trustLineData?.trustLineSetup === false) &&

                trustInstructions && trustInstructions?.instructions?.length > 0 &&
                <>
                  <Text style={{ fontSize: 18, fontWeight: "500", color: 'black', marginVertical: 6 }}>Instructions for Trust Line Process</Text>

                  {trustInstructions?.instructions.map((item: string, index: number) => {
                    return (
                      <>
                        <View style={{ marginTop: 4, flexDirection: 'row', alignItems: 'flex-start' }} key={index}>
                          <Text>{item}</Text>
                        </View>
                      </>
                    )
                  })}
                </>

              }
            </>


          ) : (
            <View style={styles.walletDisconnectedContainer}>
              <Text style={styles.mutedText}>
                Connect your XRP wallet to claim VII rewards
              </Text>
              <Input
                style={styles.textInput}
                value={walletAddress}
                onChangeText={(text) => setWalletAddress(text)}
                placeholder="Add your wallet address"
              />
              <Button disabled={walletAddress === ""} onPress={() => handleWalletConnected()} style={styles.connectWalletButton}>

                <Text style={styles.buttonText}>Connect XRP</Text>
              </Button>
            </View>
          )}
        </CardContent>
      </Card>

      {
        completedGoals && completedGoals.length > 0 && (
          <Card style={styles.goalsCard}>
            <CardHeader>
              <CardTitle style={styles.cardTitle}>
                <Feather size={20} color="black" />
                <Text>Recent Achievements</Text>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.goalsList}>
                {completedGoals.slice(0, 5).map((goal) => (
                  <View key={goal.id} style={styles.goalItem}>
                    <View style={styles.goalDetails}>
                      <Text style={styles.goalMetric}>
                        {goal.metric.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </Text>
                      <Text style={styles.goalValues}>
                        Target: {goal.targetValue} | Achieved: {goal.achievedValue.toFixed(1)}
                      </Text>
                      <Text style={styles.goalDate}>
                        {new Date(goal.completedAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <Badge variant="secondary" style={styles.rewardBadge}>
                      <Text style={styles.rewardBadgeText}>+{goal.rewardAmount} VII </Text>
                    </Badge>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )
      }

      {
        transactions && transactions.length > 0 && (
          <Card style={styles.transactionsCard}>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent>
              <View style={styles.transactionsList}>
                {transactions.slice(0, 10).map((tx) => (
                  <View key={tx.id} style={styles.transactionItem}>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionType}>
                        {tx.type === 'earned' ? 'Reward Earned' : 'Tokens Claimed'}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </Text>
                      {tx.txHash && (
                        <TouchableOpacity
                          onPress={() => WebBrowser.openBrowserAsync(`https://xrplorer.com/transaction/${tx.txHash}`)}
                          style={styles.transactionLink}
                        >
                          <Text style={styles.transactionLinkText}>View on XRP Ledger</Text>
                          <Feather size={12} color="blue" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.transactionAmountContainer}>
                      <Text style={tx.type === 'earned' ? styles.amountEarned : styles.amountClaimed}>
                        {tx.type === 'earned' ? '+' : '-'}{tx.amount} VII
                      </Text>
                      <Badge variant={tx.status === 'completed' ? "secondary" : "destructive"}>
                        <Text style={styles.transactionStatusText}>{tx.status}</Text>
                      </Badge>
                    </View>
                  </View>
                ))}
              </View>
            </CardContent>
          </Card>
        )
      }

      <WalletConnection
        isOpen={showWalletConnection}
        onClose={() => setShowWalletConnection(false)}
        onConnected={handleWalletConnected}
      />

      <ClaimRewards
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        onClaimed={handleRewardsClaimed}
        pendingBalance={balance?.pendingBalance || 0}
      />
    </SafeAreaView >

  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    // flex: 1,
    padding: 16,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    width: "32%", // Approx 1/3rd for 3 columns
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 10,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  earnedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "green",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  row: {
    flexDirection: "row",
    marginBottom: 4,
  },
  label: {
    fontWeight: "500",
    color: "#555",
    marginRight: 6,
  },
  value: {
    color: "#000",
  },
  claimText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "blue",
  },
  claimedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "orange",
  },
  mutedText: {
    fontSize: 12,
    color: "gray",
  },
  walletCard: {
    marginBottom: 20,
  },
  walletCardContent: {
    paddingTop: 10,
  },
  walletConnectedContainer: {
    // No specific styles needed, handled by children
  },
  walletInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: 14,

    flexShrink: 1,

  },
  buttonGroup: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  claimButton: {
    flex: 1,
    backgroundColor: "#007BFF",
  },
  changeWalletButton: {
    flex: 1,
    borderColor: "#007BFF",
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  walletDisconnectedContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  connectWalletButton: {
    backgroundColor: "#007BFF",
    marginTop: 10,
  },
  goalsCard: {
    marginBottom: 20,
  },
  goalsList: {
    marginTop: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    height: '100%',
    width: '100%',
    marginTop: 16
  },
  goalItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  goalDetails: {
    flex: 1,
  },
  goalMetric: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  goalValues: {
    fontSize: 12,
    color: "gray",
  },
  goalDate: {
    fontSize: 10,
    color: "gray",
  },
  rewardBadge: {
    marginLeft: 10,
    backgroundColor: "#D1FAE5",
  },
  rewardBadgeText: {
    color: "green",
  },
  transactionsCard: {
    marginBottom: 20,
  },
  transactionsList: {
    marginTop: 10,
  },
  rowWeight: {
    justifyContent: "space-between",
    marginVertical: 12,
  },
  cardWeight: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
  },
  valueWeight: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    maxWidth: '30%'
  },
  source: {
    fontSize: 14,
    color: "#666",
    flexShrink: 1,
    maxWidth: '39%'
    , textAlign: 'center'

  },
  date: {
    fontSize: 12,
    color: "#999",
    maxWidth: '30%'

  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EEEEEE",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionType: {
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  transactionDate: {
    fontSize: 12,
    color: "gray",
  },
  transactionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 5,
  },
  transactionLinkText: {
    color: "blue",
    textDecorationLine: "underline",
    fontSize: 12,
  },
  transactionAmountContainer: {
    alignItems: "flex-end",
  },
  lefuButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  amountEarned: {
    fontWeight: "bold",
    color: "green",
  },
  amountClaimed: {
    fontWeight: "bold",
    color: "blue",
  },
  transactionStatusText: {
    fontSize: 10,
  },
});
