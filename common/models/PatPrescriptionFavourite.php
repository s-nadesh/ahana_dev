<?php

namespace common\models;

use common\models\query\PatPrescriptionFavouriteQuery;
use yii\db\ActiveQuery;

/**
 * This is the model class for table "pat_prescription_favourite".
 *
 * @property integer $pres_fav_id
 * @property integer $tenant_id
 * @property integer $encounter_id
 * @property integer $patient_id
 * @property integer $product_id
 * @property string $product_name
 * @property integer $generic_id
 * @property integer $drug_class_id
 * @property integer $consultant_id
 * @property integer $pres_id
 * @property string $status
 * @property integer $created_by
 * @property string $created_at
 * @property integer $modified_by
 * @property string $modified_at
 * @property string $deleted_at
 *
 * @property CoUser $consultant
 * @property PhaDrugClass $drugClass
 * @property PatEncounter $encounter
 * @property PhaGeneric $generic
 * @property PatPrescription $pres
 * @property PhaProduct $product
 * @property CoTenant $tenant
 */
class PatPrescriptionFavourite extends RActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pat_prescription_favourite';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['encounter_id', 'patient_id', 'product_id', 'product_name', 'generic_id', 'drug_class_id', 'consultant_id', 'pres_id'], 'required'],
            [['tenant_id', 'encounter_id', 'patient_id', 'product_id', 'generic_id', 'drug_class_id', 'consultant_id', 'pres_id', 'created_by', 'modified_by'], 'integer'],
            [['status'], 'string'],
            [['created_at', 'modified_at', 'deleted_at'], 'safe'],
            [['product_name'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'pres_fav_id' => 'Pres Fav ID',
            'tenant_id' => 'Tenant ID',
            'encounter_id' => 'Encounter ID',
            'patient_id' => 'Patient ID',
            'product_id' => 'Product ID',
            'product_name' => 'Product Name',
            'generic_id' => 'Generic ID',
            'drug_class_id' => 'Drug Class ID',
            'consultant_id' => 'Consultant ID',
            'pres_id' => 'Pres ID',
            'status' => 'Status',
            'created_by' => 'Created By',
            'created_at' => 'Created At',
            'modified_by' => 'Modified By',
            'modified_at' => 'Modified At',
            'deleted_at' => 'Deleted At',
        ];
    }

    /**
     * @return ActiveQuery
     */
    public function getConsultant()
    {
        return $this->hasOne(CoUser::className(), ['user_id' => 'consultant_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getDrugClass()
    {
        return $this->hasOne(PhaDrugClass::className(), ['drug_class_id' => 'drug_class_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getEncounter()
    {
        return $this->hasOne(PatEncounter::className(), ['encounter_id' => 'encounter_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getGeneric()
    {
        return $this->hasOne(PhaGeneric::className(), ['generic_id' => 'generic_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getPres()
    {
        return $this->hasOne(PatPrescription::className(), ['pres_id' => 'pres_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getProduct()
    {
        return $this->hasOne(PhaProduct::className(), ['product_id' => 'product_id']);
    }

    /**
     * @return ActiveQuery
     */
    public function getTenant()
    {
        return $this->hasOne(CoTenant::className(), ['tenant_id' => 'tenant_id']);
    }
    
    public static function find() {
        return new PatPrescriptionFavouriteQuery(get_called_class());
    }
    
    public function fields() {
        $extend = [
            'generic_name' => function ($model) {
                return (isset($model->generic->generic_name) ? $model->generic->generic_name : '-');
            },
            'drug_name' => function ($model) {
                return (isset($model->drugClass->drug_name) ? $model->drugClass->drug_name : '-');
            },
            'description_routes' => function ($model) {
                return (isset($model->product->productDescription) ? $model->product->productDescription->routes : '-');
            },
            'product_price' => function ($model) {
                return (isset($model->product->phaLatestBatch) ? $model->product->phaLatestBatch->phaProductBatchRate->mrp : 0);
            },
            'availableQuantity' => function ($model) {
                return (isset($model->product->phaProductBatchesAvailableQty) ? $model->product->phaProductBatchesAvailableQty : 0);
            },
        ];
        $fields = array_merge(parent::fields(), $extend);
        return $fields;
    }
}
